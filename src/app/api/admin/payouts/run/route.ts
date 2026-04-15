import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

/**
 * Admin triggers batch payout settlement.
 * For each partner, it finds SETTLED scan logs that haven't been PAID,
 * sums them up, creates a Payout record, and marks the logs as PAID.
 */
export async function POST(req: Request) {
    try {
        const prisma = getPrisma();

        // RBAC: Ensure ONLY authenticated Admin can trigger payouts
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        // 1. Fetch all SETTLED scan logs with partner info in one query (Solve N+1)
        const settledLogs = await prisma.scanLog.findMany({
            where: { status: "SETTLED" },
            include: {
                guest: {
                    select: { partnerId: true, partner: { select: { name: true } } }
                }
            }
        });

        if (settledLogs.length === 0) {
            return NextResponse.json({ success: true, message: "No pending settlements found.", details: [] });
        }

        // 2. Group logs by Partner ID in memory
        const partnerGroups: Record<string, { name: string, logs: any[], total: number }> = {};
        for (const log of settledLogs) {
            const partnerId = log.guest.partnerId;
            const partnerName = log.guest.partner.name;
            if (!partnerGroups[partnerId]) {
                partnerGroups[partnerId] = { name: partnerName, logs: [], total: 0 };
            }
            partnerGroups[partnerId].logs.push(log);
            // FIX: Sum ONLY the actual partner commission amount to avoid confusion with guest discounts
            partnerGroups[partnerId].total += (log.partnerCommissionAmount || 0);
        }

        const results: any[] = [];
        
        // 3. Execute all payouts and log updates in a single Atomic Transaction
        await (prisma as any).$transaction(async (tx: any) => {
            for (const [partnerId, group] of Object.entries(partnerGroups)) {
                if (group.total <= 0) continue;

                // Create Payout Record
                const payout = await tx.payout.create({
                    data: {
                        partnerId,
                        amount: group.total,
                        status: "COMPLETED",
                        method: "BANK_TRANSFER",
                        logsCount: group.logs.length
                    }
                });

                // Mark specific Logs as PAID
                const logIds = group.logs.map(l => l.id);
                await tx.scanLog.updateMany({
                    where: { id: { in: logIds } },
                    data: { status: "PAID" }
                });

                results.push({
                    partnerName: group.name,
                    amount: group.total,
                    payoutId: payout.id,
                    logsProcessed: group.logs.length
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: `Processed atomic payouts for ${results.length} partners.`,
            details: results
        });

    } catch (error: any) {
        console.error("Batch Payout Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
