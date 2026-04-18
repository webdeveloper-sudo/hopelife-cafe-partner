import { getPrisma } from "@/lib/prisma";

/**
 * Evaluates and awards tier upgrades for a partner based on confirmed guest counts.
 * Also awards one-time monetary cash bonuses for reaching certain milestones.
 * 
 * @param partnerId The internal ID of the partner
 */
export async function evaluateTierUpgrade(partnerId: string) {
    const prisma = getPrisma() as any;
    const configModel = prisma.systemConfig || prisma.SystemConfig;
    
    // 1. Fetch Partner, Config, and Referral Count
    const [partner, config, totalReferrals] = await Promise.all([
        prisma.partner.findUnique({ where: { id: partnerId } }),
        configModel.findUnique({ where: { id: "GLOBAL" } }),
        prisma.scanLog.count({ where: { guest: { partnerId: partnerId }, status: "SETTLED" } })
    ]);

    if (!partner || !config || !config.tiers) return;

    const tiers = config.tiers as any[];
    let targetTier = tiers[0]; // Start with base tier

    // 2. Determine the highest qualified tier based on referrals
    for (const tier of tiers) {
        if (tier.referralGoal !== null && totalReferrals >= tier.referralGoal) {
            // Find the "next" tier if it exists
            const nextTier = tiers.find(t => t.key === tier.next);
            if (nextTier) targetTier = nextTier;
        }
    }

    const updates: any = {};
    const claimedBonuses = (partner.claimedTierBonuses as string[]) || [];

    // 3. Handle Tier Change
    if (targetTier.key !== partner.currentTier) {
        updates.currentTier = targetTier.key;
        updates.referralGoal = targetTier.referralGoal || partner.referralGoal;
    }

    // 4. Handle Cash Bonuses for all reached tiers (idempotent)
    let totalNewBonus = 0;
    const newClaimed = [...claimedBonuses];

    for (const tier of tiers) {
        // If they reached or passed this tier's goal (or it's bronze)
        const reachedGoal = (tier.referralGoal === null && totalReferrals >= 0) || (tier.referralGoal !== null && totalReferrals >= 0); // Wait, logic below
    }
    
    // Simpler logic: for every tier in the list, if they satisfy its referral goal (or it's the first tier)
    // and they haven't claimed its bonus yet, give it.
    for (const tier of tiers) {
        const goal = tier.referralGoal;
        const hasReached = (goal === null && tiers.indexOf(tier) === 0) || (goal !== null && totalReferrals >= goal);
        
        if (hasReached && tier.cashBonus > 0 && !newClaimed.includes(tier.key)) {
            totalNewBonus += tier.cashBonus;
            newClaimed.push(tier.key);
            console.log(`[TIER_BONUS] Awarding ₹${tier.cashBonus} to Partner ${partnerId} for reaching ${tier.key}`);
        }
    }

    if (totalNewBonus > 0) {
        updates.walletBalance = { increment: totalNewBonus };
        updates.earnedCommission = { increment: totalNewBonus };
        updates.walletTotal = { increment: totalNewBonus };
        updates.claimedTierBonuses = newClaimed;
        
        // Add specific income logs for each new reward
        for (const tierKey of newClaimed) {
             if (!claimedBonuses.includes(tierKey)) {
                 const tier = tiers.find(t => t.key === tierKey);
                 if (tier && tier.cashBonus > 0) {
                     await (prisma.incomeLog || (prisma as any).IncomeLog).create({
                         data: {
                             partnerId,
                             amount: tier.cashBonus,
                             type: "TIER_REWARD",
                             description: `Milestone reached: ${tier.label}`
                         }
                     });
                 }
             }
        }
    }

    if (Object.keys(updates).length > 0) {
        await prisma.partner.update({
            where: { id: partnerId },
            data: updates
        });
        return {
            upgraded: updates.currentTier !== undefined,
            newTier: updates.currentTier,
            bonusAwarded: totalNewBonus
        };
    }

    return null;
}
