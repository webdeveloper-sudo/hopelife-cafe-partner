import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const monthParam = searchParams.get("month"); // Format: YYYY-MM
        
        let startDate: Date;
        let endDate: Date;

        if (monthParam) {
            const [year, month] = monthParam.split("-").map(Number);
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59, 999);
        } else {
            // Default to current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const prisma = getPrisma();

        // Fetch all partners with their scan logs for the specific month
        const partners = await prisma.partner.findMany({
            where: { status: "ACTIVE" },
            include: {
                guests: {
                    include: {
                        scanLogs: {
                            where: {
                                createdAt: {
                                    gte: startDate,
                                    lte: endDate
                                },
                                status: "SETTLED"
                            }
                        }
                    }
                }
            }
        });

        const report = partners.map((p: any) => {
            const allLogs = p.guests.flatMap((g: any) => g.scanLogs);
            const monthlyCommission = allLogs.reduce((sum: number, log: any) => sum + (log.partnerCommissionAmount || 0), 0);
            const monthlySales = allLogs.reduce((sum: number, log: any) => sum + (log.billAmount || 0), 0);

            return {
                id: p.id,
                name: p.name,
                partnerCode: p.partnerCode,
                monthlyCommission,
                monthlySales,
                currentWalletBalance: p.walletBalance,
                scanCount: allLogs.length
            };
        }).filter((p: any) => p.scanCount > 0 || p.currentWalletBalance > 0);

        return NextResponse.json({
            success: true,
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            },
            data: report
        });

    } catch (error: any) {
        console.error("Monthly Preview API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
