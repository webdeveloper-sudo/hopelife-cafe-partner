import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const body = await req.json();
        const { partnerId, amount, manual } = body;

        if (!partnerId) {
            return NextResponse.json({ error: "Partner ID is required." }, { status: 400 });
        }

        const prisma = getPrisma() as any;
        const configModel = prisma.systemConfig || prisma.SystemConfig;

        // 1. Fetch Partner and Config
        const [partner, config] = await Promise.all([
            prisma.partner.findUnique({ where: { id: partnerId } }),
            configModel.findUnique({ where: { id: "GLOBAL" } })
        ]);

        if (!partner) {
            return NextResponse.json({ error: "Partner not found." }, { status: 404 });
        }

        // 2. Validate Eligibility & Threshold
        const payoutAmount = amount || partner.walletBalance;
        const minAmount = config?.minPayoutAmount || 100;
        
        if (payoutAmount < minAmount) {
            return NextResponse.json({ 
                error: `Payout below threshold. Minimum required: ₹${minAmount}` 
            }, { status: 400 });
        }

        if (payoutAmount > partner.walletBalance) {
            return NextResponse.json({ error: "Requested amount exceeds current wallet balance." }, { status: 400 });
        }

        // 3. Process Manual Settlement
        if (manual) {
            const result = await prisma.$transaction(async (tx: any) => {
                // Decrement partner's wallet balance
                const updatedPartner = await tx.partner.update({
                    where: { id: partner.id },
                    data: {
                        walletBalance: {
                            decrement: payoutAmount
                        }
                    }
                });

                // Create a COMPLETED payout record
                const payoutRecord = await tx.payout.create({
                    data: {
                        partnerId: partner.id,
                        amount: payoutAmount,
                        status: "COMPLETED",
                        method: "UPI",
                        settledAt: new Date(),
                        logsCount: 0 
                    }
                });

                return { partner: updatedPartner, payout: payoutRecord };
            });

            console.log(`[PAYOUT:MANUAL] Partner=${partner.name} Amount=${payoutAmount} Settled`);

            return NextResponse.json({
                success: true,
                message: "Payout settled manually and recorded.",
                payout: result.payout
            });
        }

        // If not manual, we skip (since Razorpay is removed)
        return NextResponse.json({ error: "Only manual settlement is currently supported." }, { status: 400 });

    } catch (error: any) {
        console.error("Payout Initiation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
