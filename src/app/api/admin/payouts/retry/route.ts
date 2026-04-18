import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { executeRazorpayPayout } from "@/lib/razorpay";
import { v4 as uuidv4 } from "uuid";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const body = await req.json();
        const { payoutId } = body;

        if (!payoutId) {
            return NextResponse.json({ error: "Payout ID is required." }, { status: 400 });
        }

        const prisma = getPrisma();

        // 1. Fetch Payout Record
        const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: { partner: true }
        });

        if (!payout) {
            return NextResponse.json({ error: "Payout record not found." }, { status: 404 });
        }

        if (payout.status !== "FAILED") {
            return NextResponse.json({ error: "Only failed payouts can be retried." }, { status: 400 });
        }

        if (payout.retryCount >= 3) {
            return NextResponse.json({ error: "Maximum retry attempts (3) exceeded for this payout." }, { status: 400 });
        }

        // 2. Validate Partner Balance (Should still be there since it's not deducted on failure)
        if (payout.partner.walletBalance < payout.amount) {
            return NextResponse.json({ error: "Partner wallet balance has changed and is now insufficient." }, { status: 400 });
        }

        // 3. Retry Initiation
        const idempotencyKey = uuidv4(); // New key for retry
        const fundAccountId = payout.partner.razorpayFundAccountId;

        if (!fundAccountId) {
            return NextResponse.json({ error: "Partner fund account details missing. Update partner details first." }, { status: 400 });
        }

        try {
            const rzpPayout = await executeRazorpayPayout({
                fundAccountId,
                amount: payout.amount,
                idempotencyKey,
                method: payout.method
            });

            const updatedPayout = await prisma.payout.update({
                where: { id: payout.id },
                data: {
                    status: "PROCESSING",
                    razorpayPayoutId: rzpPayout.id,
                    idempotencyKey,
                    retryCount: { increment: 1 },
                    failureReason: null
                }
            });

            console.log(`[PAYOUT:RETRY] PayoutId=${payout.id} New RZP_ID=${rzpPayout.id}`);

            return NextResponse.json({
                success: true,
                message: "Payout retry initiated.",
                payout: updatedPayout
            });

        } catch (rzpError: any) {
            console.error("Retry Razorpay Error:", rzpError);
            await prisma.payout.update({
                where: { id: payout.id },
                data: {
                    retryCount: { increment: 1 },
                    failureReason: rzpError.message || "Retry failed"
                }
            });
            return NextResponse.json({ error: "Retry failed.", details: rzpError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Payout Retry API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
