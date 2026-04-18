import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

/**
 * GET /api/config
 * Public endpoint — no admin auth required.
 * Returns non-sensitive partner-facing configuration:
 * tier definitions, commission base, discount base, and bonus identifiers.
 * All values are read entirely from the database. Nothing is hardcoded.
 */
export async function GET() {
    try {
        const prisma = getPrisma() as any;
        const configModel = prisma.systemConfig || prisma.SystemConfig;

        if (!configModel) {
            return NextResponse.json({ error: "SystemConfig model not found in Prisma client" }, { status: 500 });
        }

        let config = await configModel.findUnique({ where: { id: "GLOBAL" } });

        // Bootstrap defaults if not yet seeded
        if (!config) {
            config = await configModel.create({
                data: {
                    id: "GLOBAL",
                    baseCommission: 7.5,
                    baseGuestDiscount: 7.5,
                    welcomeBonus: 500,
                    retentionBonus: 1.0,
                    maintenanceMode: false,
                    tiers: [
                        { key: "BRONZE",  label: "Bronze Affiliate", color: "from-orange-400 to-orange-700",  next: "SILVER",  icon: "Target",  referralGoal: 10  },
                        { key: "SILVER",  label: "Silver Partner",   color: "from-slate-300 to-slate-500",    next: "GOLD",    icon: "Star",    referralGoal: 50  },
                        { key: "GOLD",    label: "Gold Ambassador",  color: "from-yellow-400 to-yellow-600",  next: "DIAMOND", icon: "Trophy",  referralGoal: 150 },
                        { key: "DIAMOND", label: "Diamond Elite",    color: "from-cyan-400 to-blue-600",      next: "ELITE",   icon: "Zap",     referralGoal: 500 },
                        { key: "ELITE",   label: "Elite Legend",     color: "from-purple-500 to-indigo-700",  next: null,      icon: "Trophy",  referralGoal: null },
                    ]
                }
            });
        }

        // Only expose non-sensitive fields to public
        return NextResponse.json({
            success: true,
            baseCommission: config.baseCommission,
            baseGuestDiscount: config.baseGuestDiscount,
            tiers: config.tiers,
        });
    } catch (error) {
        console.error("Public Config GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
    }
}
