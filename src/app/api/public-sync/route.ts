import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

/**
 * ADMINISTRATIVE UTILITY: Repair and Synchronize Partner Wallets
 * Recalculates walletTotal, earnedCommission, and bonusAmount from actual ledger logs.
 * Use this to fix discrepancies caused by stale Prisma Client caches during schema migration.
 */
export async function POST() {
    try {
        /*
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
        }
        */

        const prisma = getPrisma();
        
        // 1. Fetch all partners
        const partners = await prisma.partner.findMany({
            include: {
                guests: {
                    include: {
                        scanLogs: {
                            where: { status: { in: ["SETTLED", "PAID"] } }
                        }
                    }
                },
                incomeLogs: true,
                payouts: {
                    where: { status: "COMPLETED" }
                }
            }
        });

        const syncResults = [];

        for (const partner of partners) {
            // A. Calculate Earned Commission (from ScanLogs)
            const allScans = partner.guests.flatMap((g: any) => g.scanLogs);
            const verifiedCommission = allScans.reduce((sum: number, log: any) => sum + (log.partnerCommissionAmount || 0), 0);

            // B. Calculate Bonus Amount (from IncomeLogs)
            const verifiedBonus = partner.incomeLogs.reduce((sum: number, log: any) => sum + (log.amount || 0), 0);

            // C. Calculate Total Withdrawn (from Payouts)
            const verifiedWithdrawn = partner.payouts.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

            // D. Calculated True Balance
            const verifiedTotal = (verifiedCommission + verifiedBonus) - verifiedWithdrawn;

            // E. Apply Update
            const updated = await prisma.partner.update({
                where: { id: partner.id },
                data: {
                    earnedCommission: verifiedCommission,
                    bonusAmount: verifiedBonus,
                    walletTotal: verifiedTotal,
                    walletBalance: verifiedTotal // Match legacy field for safety
                }
            });

            // F. Sync Guest isRedeemed status (Repair Logic)
            for (const guest of partner.guests) {
                const hasScan = guest.scanLogs.length > 0;
                if (guest.isRedeemed !== hasScan) {
                    await prisma.guest.update({
                        where: { id: guest.id },
                        data: { isRedeemed: hasScan }
                    });
                }
            }

            syncResults.push({
                partnerCode: partner.partnerCode,
                previous: {
                    earned: partner.earnedCommission,
                    bonus: partner.bonusAmount,
                    total: partner.walletTotal
                },
                synced: {
                    earned: verifiedCommission,
                    bonus: verifiedBonus,
                    total: verifiedTotal
                },
                adjustment: verifiedTotal - (partner.walletTotal || 0)
            });
        }

        return NextResponse.json({
            success: true,
            message: `Synchronized ${partners.length} partner wallets.`,
            results: syncResults
        });

    } catch (error: any) {
        console.error("Wallet Sync API Error:", error);
        return NextResponse.json({ 
            error: "Failed to sync wallets", 
            details: error.message 
        }, { status: 500 });
    }
}
