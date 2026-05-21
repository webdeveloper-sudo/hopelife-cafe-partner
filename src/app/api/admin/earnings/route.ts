import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const prisma = getPrisma();

        // 1. Get branch admins
        const [whiteTownAdmin, aurovilleAdmin] = await Promise.all([
            prisma.admin.findUnique({ where: { email: "whitetown@hopecafe.com" } }),
            prisma.admin.findUnique({ where: { email: "auroville@hopecafe.com" } })
        ]);

        const whiteTownId = whiteTownAdmin?.id || "";
        const aurovilleId = aurovilleAdmin?.id || "";

        // 2. Fetch all scan logs (settled or paid) with guest and partner details
        const scanLogs = await prisma.scanLog.findMany({
            where: {
                status: { in: ["SETTLED", "PAID"] }
            },
            include: {
                guest: {
                    select: {
                        name: true,
                        mobileNumber: true,
                        partner: {
                            select: {
                                name: true,
                                partnerCode: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // 3. Compute detailed payment list
        const paymentList = scanLogs.map((log: any) => {
            let outlet = "Unknown Outlet";
            if (log.adminId === whiteTownId) {
                outlet = "White Town";
            } else if (log.adminId === aurovilleId) {
                outlet = "Auroville";
            }
            return {
                id: log.id,
                date: log.createdAt,
                billAmount: log.billAmount,
                discountAmount: log.discountAmount,
                partnerCommission: log.partnerCommissionAmount,
                guestName: log.guest.name,
                guestMobile: log.guest.mobileNumber,
                partnerName: log.guest.partner.name,
                partnerCode: log.guest.partner.partnerCode,
                outlet,
                status: log.status
            };
        });

        // 4. Time aggregations: Daily (last 7 days), Weekly (last 4 weeks), Monthly (last 6 months)
        const daily: { [key: string]: { whiteTown: number; auroville: number; combined: number } } = {};
        const weekly: { [key: string]: { whiteTown: number; auroville: number; combined: number } } = {};
        const monthly: { [key: string]: { whiteTown: number; auroville: number; combined: number } } = {};

        const now = new Date();

        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            daily[dateStr] = { whiteTown: 0, auroville: 0, combined: 0 };
        }

        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const weekStr = `Week -${i}`;
            weekly[weekStr] = { whiteTown: 0, auroville: 0, combined: 0 };
        }

        // Last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const monthStr = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            monthly[monthStr] = { whiteTown: 0, auroville: 0, combined: 0 };
        }

        // Process ScanLogs for stats
        scanLogs.forEach((log: any) => {
            const logDate = new Date(log.createdAt);
            const amt = log.billAmount || 0;
            const isWhiteTown = log.adminId === whiteTownId;
            const isAuroville = log.adminId === aurovilleId;

            if (!isWhiteTown && !isAuroville) return;

            // Daily mapping
            const dayKey = logDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (daily[dayKey] !== undefined) {
                if (isWhiteTown) daily[dayKey].whiteTown += amt;
                if (isAuroville) daily[dayKey].auroville += amt;
                daily[dayKey].combined += amt;
            }

            // Monthly mapping
            const monthKey = logDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            if (monthly[monthKey] !== undefined) {
                if (isWhiteTown) monthly[monthKey].whiteTown += amt;
                if (isAuroville) monthly[monthKey].auroville += amt;
                monthly[monthKey].combined += amt;
            }

            // Weekly mapping
            const diffTime = Math.abs(now.getTime() - logDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 28) {
                const weekIndex = Math.floor((diffDays - 1) / 7); // 0, 1, 2, 3
                if (weekIndex >= 0 && weekIndex < 4) {
                    const weekKey = `Week -${weekIndex}`;
                    if (weekly[weekKey] !== undefined) {
                        if (isWhiteTown) weekly[weekKey].whiteTown += amt;
                        if (isAuroville) weekly[weekKey].auroville += amt;
                        weekly[weekKey].combined += amt;
                    }
                }
            }
        });

        // Convert key-value objects to structured arrays for easier charting/listing
        const dailyData = Object.keys(daily).map(key => ({ name: key, ...daily[key] }));
        const weeklyData = Object.keys(weekly).map(key => ({ name: key, ...weekly[key] })).reverse(); // order chronologically
        const monthlyData = Object.keys(monthly).map(key => ({ name: key, ...monthly[key] }));

        return NextResponse.json({
            success: true,
            summary: {
                whiteTownTotal: paymentList.filter((p: any) => p.outlet === "White Town").reduce((acc: number, p: any) => acc + p.billAmount, 0),
                aurovilleTotal: paymentList.filter((p: any) => p.outlet === "Auroville").reduce((acc: number, p: any) => acc + p.billAmount, 0),
                combinedTotal: paymentList.reduce((acc: number, p: any) => acc + p.billAmount, 0)
            },
            daily: dailyData,
            weekly: weeklyData,
            monthly: monthlyData,
            payments: paymentList
        });

    } catch (error: any) {
        console.error("Earnings fetch error:", error);
        return NextResponse.json({ error: "Failed to load earnings stats", details: error.message }, { status: 500 });
    }
}
