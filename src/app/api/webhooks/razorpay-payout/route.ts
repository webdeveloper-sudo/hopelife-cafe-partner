import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { validateWebhookSignature } from "@/lib/razorpay";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const isSimulation = process.env.WEBHOOK_SIMULATION === "true" && signature === "SIMULATED_SIGNATURE";

    if (!isSimulation && !validateWebhookSignature(rawBody, signature)) {
        console.warn("[PAYOUT WEBHOOK] Invalid signature detected.");
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    }

    if (isSimulation) console.log("[PAYOUT WEBHOOK] Processing SIMULATED event.");

    try {
        const event = JSON.parse(rawBody);
        const { event: eventName, payload } = event;
        const payout = payload.payout.entity;
        const rzpPayoutId = payout.id;
        const status = payout.status; // processed, reversed, cancelled, rejected, failed

        console.log(`[PAYOUT WEBHOOK] Event=${eventName} RZP_ID=${rzpPayoutId} Status=${status}`);

        const prisma = getPrisma();

        // Find the internal payout record
        const internalPayout = await prisma.payout.findFirst({
            where: { razorpayPayoutId: rzpPayoutId }
        });

        if (!internalPayout) {
            console.warn(`[PAYOUT WEBHOOK] No internal payout record found for RZP_ID=${rzpPayoutId}`);
            return NextResponse.json({ success: true, message: "No internal record found" });
        }

        if (eventName === "payout.processed") {
            // Success: Deduct wallet and mark as completed
            if (internalPayout.status !== "COMPLETED") {
                await prisma.$transaction(async (tx) => {
                    const partner = await tx.partner.findUnique({ where: { id: internalPayout.partnerId } });
                    if (!partner) return;

                    const amount = internalPayout.amount;
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
                        where: { id: internalPayout.id },
                        data: {
                            status: "COMPLETED",
                            settledAt: new Date()
                        }
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
                console.log(`[PAYOUT:WALLET_DEDUCTED] PartnerId=${internalPayout.partnerId} Amount=${internalPayout.amount}`);
            }
        } 
        else if (eventName === "payout.failed" || eventName === "payout.rejected") {
            // Failure: Mark as FAILED, no wallet deduction
            await prisma.payout.update({
                where: { id: internalPayout.id },
                data: {
                    status: "FAILED",
                    failureReason: payout.status_details?.description || payout.failure_reason || "Payout failed"
                }
            });
        }
        else if (eventName === "payout.reversed") {
            // Reversal: Re-credit wallet if it was previously deducted
            if (internalPayout.status === "COMPLETED") {
                await prisma.$transaction(async (tx) => {
                    await tx.payout.update({
                        where: { id: internalPayout.id },
                        data: {
                            status: "REVERSED",
                            failureReason: "Payout reversed by bank"
                        }
                    });

                    // For reversal, we add back to commission bucket primarily as bonuses are usually used up first
                    await tx.partner.update({
                        where: { id: internalPayout.partnerId },
                        data: {
                            walletBalance: { increment: internalPayout.amount },
                            walletTotal: { increment: internalPayout.amount },
                            earnedCommission: { increment: internalPayout.amount }
                        }
                    });
                });
                console.log(`[PAYOUT:REVERSED] Wallet re-credited for PartnerId=${internalPayout.partnerId}`);
            } else {
                await prisma.payout.update({
                    where: { id: internalPayout.id },
                    data: { status: "REVERSED" }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
