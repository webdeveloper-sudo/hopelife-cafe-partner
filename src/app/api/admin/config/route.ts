import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

/**
 * GET /api/admin/config
 * Returns the full global system configuration for the admin panel.
 */
export async function GET() {
    try {
        const prisma = getPrisma() as any;
        const configModel = prisma.systemConfig || prisma.SystemConfig;
        
        if (!configModel) {
            return NextResponse.json({ error: "SystemConfig model not found in Prisma client" }, { status: 500 });
        }

        let config = await configModel.findUnique({ where: { id: "GLOBAL" } });

        if (!config) {
            config = await configModel.create({
                data: {
                    id: "GLOBAL",
                    baseCommission: 7.5,
                    baseGuestDiscount: 7.5,
                    welcomeBonus: 500,
                    retentionBonus: 1.0,
                    minPayoutAmount: 100, // Default threshold
                    maintenanceMode: false,
                    tiers: [
                        { key: "BRONZE",  label: "Bronze Affiliate", color: "from-orange-400 to-orange-700",  next: "SILVER",  icon: "Target",  referralGoal: 10,  cashBonus: 0 },
                        { key: "SILVER",  label: "Silver Partner",   color: "from-slate-300 to-slate-500",    next: "GOLD",    icon: "Star",    referralGoal: 50,  cashBonus: 500 },
                        { key: "GOLD",    label: "Gold Ambassador",  color: "from-yellow-400 to-yellow-600",  next: "DIAMOND", icon: "Trophy",  referralGoal: 150, cashBonus: 1500 },
                        { key: "DIAMOND", label: "Diamond Elite",    color: "from-cyan-400 to-blue-600",      next: "ELITE",   icon: "Zap",     referralGoal: 500, cashBonus: 5000 },
                        { key: "ELITE",   label: "Elite Legend",     color: "from-purple-500 to-indigo-700",  next: null,      icon: "Trophy",  referralGoal: null, cashBonus: 10000 },
                    ]
                }
            });
        }

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error("Config GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/config
 * Updates the global system configuration.
 * Supports partial updates — only supplied fields are changed.
 *
 * When tiers are updated and a tier key is removed, all partners currently
 * assigned to that tier are reassigned to the first available tier.
 */
export async function PATCH(req: Request) {
    try {
        const data = await req.json();
        const prisma = getPrisma() as any;
        const configModel = prisma.systemConfig || prisma.SystemConfig;

        if (!configModel) {
            return NextResponse.json({ error: "SystemConfig model not found in Prisma client" }, { status: 500 });
        }

        // If tiers are being updated, handle partner reassignment for removed tiers
        if (data.tiers && Array.isArray(data.tiers)) {
            const newTierKeys = new Set(data.tiers.map((t: any) => t.key));
            const currentConfig = await configModel.findUnique({ where: { id: "GLOBAL" } });

            if (currentConfig?.tiers) {
                const currentTiers = currentConfig.tiers as any[];
                const removedKeys = currentTiers
                    .map((t: any) => t.key)
                    .filter((key: string) => !newTierKeys.has(key));

                if (removedKeys.length > 0) {
                    // Reassign partners on removed tiers to the first remaining tier (or BRONZE fallback)
                    const fallbackTier = data.tiers[0]?.key || "BRONZE";
                    await prisma.partner.updateMany({
                        where: { currentTier: { in: removedKeys } },
                        data: { currentTier: fallbackTier }
                    });
                }
            }
        }

        const config = await configModel.upsert({
            where: { id: "GLOBAL" },
            update: { ...data, updatedAt: new Date() },
            create: { id: "GLOBAL", ...data }
        });

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error("Config PATCH Error:", error);
        return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
    }
}
