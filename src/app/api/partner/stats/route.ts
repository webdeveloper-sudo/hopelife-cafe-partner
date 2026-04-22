export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { evaluateRetentionStreak } from "@/lib/retention";

export async function GET(req: Request) {
    try {
        const prisma = getPrisma();

        // Derive partnerId from the authenticated session
        const session = await getSession();
        const partnerCodeFromSession = session?.partnerCode as string | undefined;

        // Allow admin override via query param only for admin tokens
        const { searchParams } = new URL(req.url);
        const queryPartnerId = searchParams.get('partnerId');
        const partnerId = (session?.role === "ADMIN" && queryPartnerId)
            ? queryPartnerId
            : (partnerCodeFromSession || 'demo');

        let partner = await prisma.partner.findUnique({
            where: { partnerCode: partnerId }
        });

        // Auto-seed for demo purposes if it doesn't exist yet
        if (!partner && partnerId === 'demo') {
            // Fetch base config for default slab
            const p = prisma as any;
            const configModel = p.systemConfig || p.SystemConfig;
            const config = configModel ? await configModel.findUnique({ where: { id: "GLOBAL" } }) : null;
            const baseCommission = config?.baseCommission ?? 7.5;
            partner = await prisma.partner.create({
                data: {
                    partnerCode: "demo",
                    name: "Grand Hope Cafe (Demo)",
                    email: "demo@partner.hub",
                    mobile: "0000000000",
                    commissionSlab: baseCommission,
                    bonusCommission: 0,
                    retentionStreak: 0,
                }
            });
        }

        if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

        // Trigger retention streak evaluation for the current month (non-blocking)
        // This is a background evaluation — errors here should not fail the stats request
        try {
            await evaluateRetentionStreak(partner.id);
            // Re-fetch partner to get updated bonusCommission after evaluation
            const refreshed = await prisma.partner.findUnique({ where: { id: partner.id } });
            if (refreshed) partner = refreshed;
        } catch (streakErr) {
            console.warn("Retention streak evaluation skipped:", streakErr);
        }

        // Effective commission = partner's individual slab + any earned bonus %
        const effectiveCommission = partner.commissionSlab + (partner.bonusCommission ?? 0);

        // Total Guests Registered (Leads)
        const totalLeads = await prisma.guest.count({
            where: { partnerId: partner.id }
        });

        // Get all applicable scans for this partner
        const allScanLogs = await prisma.scanLog.findMany({
            where: { status: { in: ["SETTLED", "PAID"] } as any },
            include: { guest: true }
        });

        const scanLogs = allScanLogs
            .filter((log: any) => log.guest?.partnerId === partner!.id)
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        let totalCommission = 0;
        let totalSales = 0;
        let totalPaid = 0;

        const recentReferrals = scanLogs.slice(0, 50).map((log: any) => {
            // Use stored partnerCommissionAmount if available, else compute from effective rate
            const comm = log.partnerCommissionAmount ?? (log.billAmount * (effectiveCommission / 100));

            totalCommission += comm;
            totalSales += log.billAmount;
            if (log.status === "PAID") totalPaid += comm;

            return {
                id: log.id,
                date: new Date(log.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                name: log.guest?.name ?? 'Unknown',
                bill: log.billAmount,
                commission: comm,
                status: log.status
            };
        });

        // Get Payout History and Total Withdrawn
        const payouts = await prisma.payout.findMany({
            where: { partnerId: partner.id }
        });
        const totalWithdrawn = payouts
            .filter((p: any) => p.status === "COMPLETED" || p.status === "PROCESSING")
            .reduce((sum: number, p: any) => sum + p.amount, 0);

        // Calculate Tier Bonuses
        const p = prisma as any;
        const configModel = p.systemConfig || p.SystemConfig;
        const config = await configModel.findUnique({ where: { id: "GLOBAL" } });
        
        let totalTierBonus = 0;
        const claimed = (partner.claimedTierBonuses as string[]) || [];
        if (config?.tiers) {
            const tiers = config.tiers as any[];
            claimed.forEach(tierKey => {
                const tier = tiers.find(t => t.key === tierKey);
                if (tier) totalTierBonus += (tier.cashBonus || 0);
            });
        }

        const welcomeBonus = config?.welcomeBonus || 500;
        const computedAvailableBalance = (welcomeBonus + totalCommission + totalTierBonus) - totalWithdrawn;

        // Fetch Income Logs (New multi-attribute history)
        const incomeLogs = await prisma.incomeLog.findMany({
            where: { partnerId: partner.id },
            orderBy: { createdAt: "desc" }
        });

        // Ledger Source of Truth (sync-wallets script ensures these are accurate)
        const walletTotal = partner.walletTotal ?? 0;

        return NextResponse.json({
            success: true,
            metrics: {
                totalLeads,
                totalCommission,
                totalSales,
                totalPaid,
                totalOwed: totalCommission - totalPaid,
                welcomeBonus: partner.bonusAmount ?? 0,
                tierBonuses: totalTierBonus,
                totalWithdrawn,
                availableBalance: walletTotal
            },
            recentReferrals,
            receivingHistory: [
                ...incomeLogs.map((log: any) => ({
                    id: log.id.slice(0, 8),
                    type: log.type === "WELCOME_BONUS" ? "Welcome Bonus" : "Tier Reward",
                    amount: log.amount ?? 0,
                    date: new Date(log.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: "Settled"
                })),
                ...scanLogs.map((log: any) => ({
                    id: log.id.slice(0, 8),
                    type: "Referral Commission",
                    amount: log.partnerCommissionAmount ?? 0,
                    date: new Date(log.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: log.status === "PAID" ? "Settled" : "Pending"
                }))
            ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            payouts: payouts
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5),
            partnerDetails: {
                name: partner.name,
                code: partner.partnerCode,
                contactName: partner.contactName || partner.name,
                email: partner.email,
                mobile: partner.mobile,
                address: partner.address,
                city: partner.city,
                pincode: partner.pincode,
                bankAccount: partner.bankAccount,
                ifsc: partner.ifsc,
                bankName: partner.bankName,
                accountHolderName: partner.accountHolderName,
                upiId: partner.upiId,
                slab: partner.commissionSlab,
                bonusCommission: partner.bonusCommission ?? 0,
                effectiveSlab: effectiveCommission,
                guestDiscountSlab: partner.guestDiscountSlab || partner.commissionSlab,
                retentionStreak: partner.retentionStreak ?? 0,
                currentTier: partner.currentTier || "BRONZE",
                businessType: partner.businessType || "N/A",
                referralGoal: partner.referralGoal || 10,
                totalLeads,
                walletTotal: walletTotal ?? 0,
                walletBalance: walletTotal ?? 0, 
                bonusAmount: partner.bonusAmount ?? 0,
                earnedCommission: partner.earnedCommission ?? 0,
                claimedTierBonuses: claimed
            }
        });

    } catch (error) {
        console.error("Partner Stats Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
