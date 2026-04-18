export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
    try {
        const prisma = getPrisma();

        // Fetch all scan logs (no admin-scope filter — cafe admin sees all outlet scans)
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [allScans, todayScans, recentActivity] = await Promise.all([
            prisma.scanLog.findMany({
                where: { status: { in: ["SETTLED", "COMPLETED"] } },
                select: {
                    billAmount: true,
                    discountAmount: true,
                    guestDiscountAmount: true,
                    partnerCommissionAmount: true,
                    createdAt: true,
                }
            }),
            prisma.scanLog.findMany({
                where: {
                    status: { in: ["SETTLED", "COMPLETED"] },
                    createdAt: { gte: startOfToday }
                },
                select: {
                    billAmount: true,
                    discountAmount: true,
                    guestDiscountAmount: true,
                    createdAt: true,
                }
            }),
            prisma.scanLog.findMany({
                where: { status: { in: ["SETTLED", "COMPLETED"] } },
                orderBy: { createdAt: "desc" },
                take: 20,
                include: {
                    guest: {
                        select: {
                            name: true,
                            mobileNumber: true,
                            partner: {
                                select: { name: true, partnerCode: true }
                            }
                        }
                    }
                }
            })
        ]);

        const totalSales = allScans.reduce((s: number, l: any) => s + l.billAmount, 0);
        const totalDiscounts = allScans.reduce((s: number, l: any) => s + (l.guestDiscountAmount || l.discountAmount || 0), 0);
        const todaySales = todayScans.reduce((s: number, l: any) => s + l.billAmount, 0);
        const todayDiscounts = todayScans.reduce((s: number, l: any) => s + (l.guestDiscountAmount || l.discountAmount || 0), 0);

        const activityFeed = recentActivity.map((log: any) => ({
            id: log.id,
            guestName: log.guest?.name || "Unknown Guest",
            mobile: log.guest?.mobileNumber || "",
            partnerName: log.guest?.partner?.name || "Unknown",
            partnerCode: log.guest?.partner?.partnerCode || "",
            billAmount: log.billAmount,
            discountAmount: log.guestDiscountAmount || log.discountAmount,
            partnerCommission: log.partnerCommissionAmount,
            createdAt: log.createdAt,
        }));

        return NextResponse.json({
            success: true,
            stats: {
                totalTransactions: allScans.length,
                totalSales: totalSales.toFixed(2),
                totalDiscounts: totalDiscounts.toFixed(2),
                todayTransactions: todayScans.length,
                todaySales: todaySales.toFixed(2),
                todayDiscounts: todayDiscounts.toFixed(2),
            },
            activityFeed,
        });
    } catch (error: any) {
        console.error("Cafe Stats Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
