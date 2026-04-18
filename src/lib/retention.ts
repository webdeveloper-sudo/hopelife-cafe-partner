import { getPrisma } from "@/lib/prisma";

/**
 * Evaluates the retention (consecutive monthly referral) streak for a given partner.
 * If they have made at least one guest referral every month for 3 consecutive months,
 * their bonusCommission is incremented by 1%.
 *
 * This function is idempotent per calendar month — it will not re-evaluate if
 * the streak has already been assessed in the current month.
 *
 * Maintenance Mode: if the global config has maintenanceMode = true, the evaluation
 * is fully suspended and no changes are applied.
 */
export async function evaluateRetentionStreak(partnerId: string): Promise<void> {
    const prisma = getPrisma() as any;
    const configModel = prisma.systemConfig || prisma.SystemConfig;

    // 1. Check global maintenance mode
    const config = configModel ? await configModel.findUnique({ where: { id: "GLOBAL" } }) : null;
    if (config?.maintenanceMode) return;

    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) return;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month

    // 2. Already evaluated this calendar month — skip
    if (partner.lastStreakEvaluated) {
        const lastEval = new Date(partner.lastStreakEvaluated);
        const lastMonth = new Date(lastEval.getFullYear(), lastEval.getMonth(), 1);
        if (lastMonth.getTime() === thisMonth.getTime()) return;
    }

    // 3. Check each of the last 3 months (not including current month) for ≥1 referral
    const streakMonths = 3;
    let consecutiveMonths = 0;

    for (let i = 1; i <= streakMonths; i++) {
        // The month to check: i months ago
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const referralsInMonth = await prisma.guest.count({
            where: {
                partnerId: partner.id,
                createdAt: { gte: monthStart, lt: monthEnd }
            }
        });

        if (referralsInMonth >= 1) {
            consecutiveMonths++;
        } else {
            break; // Streak broken
        }
    }

    // 4. If 3 consecutive months achieved, apply 1% increment
    if (consecutiveMonths >= streakMonths) {
        await prisma.partner.update({
            where: { id: partnerId },
            data: {
                bonusCommission: { increment: 1.0 },
                retentionStreak: { increment: 1 },
                lastStreakEvaluated: now
            }
        });
    } else {
        // Still record evaluation so we don't re-check this month, just reset streak if broken
        const newStreak = consecutiveMonths > 0 ? consecutiveMonths : 0;
        await prisma.partner.update({
            where: { id: partnerId },
            data: {
                retentionStreak: newStreak,
                lastStreakEvaluated: now
            }
        });
    }
}
