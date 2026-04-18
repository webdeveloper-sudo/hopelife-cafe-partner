import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { fetchRazorpayPayout } from "@/lib/razorpay";

export const runtime = 'nodejs';

/**
 * Reconciles stuck PROCESSING payouts by querying Razorpay API
 * Targets any PROCESSING payout
 */
export async function POST() {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const prisma = getPrisma();
        
        // Find all PROCESSING payouts
        const stuckPayouts = await prisma.payout.findMany({
            where: { status: "PROCESSING" }
        });

        if (stuckPayouts.length === 0) {
            return NextResponse.json({ success: true, message: "No processing payouts found." });
        }

        const results = [];

        for (const payout of stuckPayouts) {
            if (!payout.razorpayPayoutId) {
                results.push({ id: payout.id, status: "SKIPPED", error: "Missing Razorpay Payout ID" });
                continue;
            }

            try {
                const rzpPayout = await fetchRazorpayPayout(payout.razorpayPayoutId);
                const rzpStatus = rzpPayout.status.toUpperCase(); // processed, reversed, failed, cancelled, rejected

                let finalStatus = "PROCESSING";
                let failureReason = null;

                if (rzpStatus === "PROCESSED") {
                    // Success: Need to deduct wallet using multi-attribute logic (Bonus first)
                    await prisma.$transaction(async (tx) => {
                        const partner = await tx.partner.findUnique({ where: { id: payout.partnerId } });
                        if (!partner) return;

                        const amount = payout.amount;
                        let newBonus = partner.bonusAmount || 0;
                        let newComm = partner.earnedCommission || 0;

                        if (newBonus >= amount) {
                            newBonus -= amount;
                        } else {
                            const remaining = amount - newBonus;
                            newBonus = 0;
                            newComm = Math.max(0, newComm - remaining);
                        }

                        await tx.payout.update({
                            where: { id: payout.id },
                            data: { status: "COMPLETED", settledAt: new Date() }
                        });

                        await tx.partner.update({
                            where: { id: partner.id },
                            data: { 
                                walletBalance: { decrement: amount },
                                walletTotal: { decrement: amount },
                                bonusAmount: newBonus,
                                earnedCommission: newComm
                            }
                        });
                    });
                    finalStatus = "COMPLETED";
                } else if (["FAILED", "REVERSED", "CANCELLED", "REJECTED"].includes(rzpStatus)) {
                    failureReason = rzpPayout.status_details?.description || rzpPayout.failure_reason || rzpStatus;
                    await prisma.payout.update({
                        where: { id: payout.id },
                        data: { status: "FAILED", failureReason }
                    });
                    finalStatus = "FAILED";
                }

                results.push({ 
                    id: payout.id, 
                    rzpId: payout.razorpayPayoutId, 
                    previousStatus: "PROCESSING", 
                    newStatus: finalStatus,
                    rzpRawStatus: rzpStatus
                });

            } catch (err: any) {
                console.error(`Reconciliation Error for ${payout.id}:`, err);
                results.push({ id: payout.id, status: "ERROR", error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            totalChecked: stuckPayouts.length,
            results
        });

    } catch (error: any) {
        console.error("Reconciliation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
