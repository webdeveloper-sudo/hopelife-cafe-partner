import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const prisma = getPrisma();

        // 1. Fetch Partner Basic Info
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: {
                guests: {
                    include: {
                        scanLogs: true
                    }
                },
                payouts: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        // 2. Aggregate Metrics
        const totalReferrals = partner.guests.length;
        
        // Scan logs across all guests
        const allScans = partner.guests.flatMap(g => g.scanLogs);
        const salesConverted = allScans.length;
        
        const totalBusinessVolume = allScans.reduce((sum, log) => sum + (log.billAmount || 0), 0);
        const totalEarnedCommission = allScans.reduce((sum, log) => sum + (log.partnerCommissionAmount || 0), 0);
        
        // Dates
        const lastReferalDate = partner.guests.length > 0 
            ? partner.guests.reduce((latest, g) => {
                const guestDate = new Date(g.createdAt);
                return guestDate > latest ? guestDate : latest;
              }, new Date(0))
            : null;

        const lastActiveDate = allScans.length > 0
            ? allScans.reduce((latest, s) => {
                const scanDate = new Date(s.createdAt);
                return scanDate > latest ? scanDate : latest;
              }, new Date(0))
            : null;

        const totalPayoutAmount = partner.payouts.reduce((sum, p) => sum + (p.amount || 0), 0);

        // 3. Performance Momentum (Last 7 Days) for this specific partner
        const weeklyPerformance = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            const dayStart = new Date(d.setHours(0, 0, 0, 0));
            const dayEnd = new Date(d.setHours(23, 59, 59, 999));

            const dayReferrals = partner.guests.filter(g => {
                const created = new Date(g.createdAt);
                return created >= dayStart && created <= dayEnd;
            }).length;

            const dayRevenue = allScans.filter(l => {
                const created = new Date(l.createdAt);
                return created >= dayStart && created <= dayEnd;
            }).reduce((acc, l) => acc + (l.billAmount || 0), 0);

            weeklyPerformance.push({
                name: dateStr,
                referrals: dayReferrals,
                revenue: dayRevenue
            });
        }

        // 4. Format Guest Details with their scan counts
        const guestActivity = partner.guests.map(g => ({
            id: g.id,
            name: g.name,
            mobile: g.mobileNumber,
            joinDate: g.createdAt,
            scanCount: g.scanLogs.length,
            totalBill: g.scanLogs.reduce((sum, s) => sum + s.billAmount, 0)
        })).sort((a, b) => b.scanCount - a.scanCount);

        return NextResponse.json({
            success: true,
            partner: {
                ...partner,
                password: null // Security
            },
            metrics: {
                totalReferrals,
                salesConverted,
                totalBusinessVolume: totalBusinessVolume.toFixed(2),
                totalEarnedCommission: (partner.earnedCommission ?? 0).toFixed(2), // Verified from ledger
                lastReferalDate,
                lastActiveDate,
                totalPayoutAmount: totalPayoutAmount.toFixed(2),
                currentSettlementBalance: (partner.walletTotal ?? 0).toFixed(2), // Unified Hero Metric
                bonusAmount: partner.bonusAmount ?? 0,
                earnedCommission: partner.earnedCommission ?? 0,
                walletTotal: partner.walletTotal ?? 0
            },
            weeklyPerformance,
            guestActivity,
            payoutHistory: partner.payouts
        });

    } catch (error) {
        console.error("Partner Detail API Error:", error);
        return NextResponse.json({ error: "Failed to fetch partner analytics" }, { status: 500 });
    }
}
