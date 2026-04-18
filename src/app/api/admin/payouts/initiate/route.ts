import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getOrCreateContact, getOrCreateFundAccount, executeRazorpayPayout, fetchBankingBalance } from "@/lib/razorpay";
import { v4 as uuidv4 } from "uuid";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    // Force Refresh: 2026-04-17-1114
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const body = await req.json();
        const { partnerId, amount } = body;

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

        // 3. Check for existing PROCESSING payout (Lock)
        const activePayout = await prisma.payout.findFirst({
            where: {
                partnerId: partner.id,
                status: "PROCESSING"
            }
        });

        if (activePayout) {
            return NextResponse.json({ error: "A payout is already in progress for this partner." }, { status: 409 });
        }

        // 4. Razorpay Balance Verification
        const currentBalance = await fetchBankingBalance();
        if (currentBalance < payoutAmount) {
            return NextResponse.json({ 
                error: "Insufficient Razorpay gateway balance.",
                required: payoutAmount,
                current: currentBalance
            }, { status: 400 });
        }

        // 5. Razorpay Integration
        let contactId = partner.razorpayContactId;
        let fundAccountId = partner.razorpayFundAccountId;

        try {
            // Ensure Contact exists
            if (!contactId) {
                contactId = await getOrCreateContact(partner);
                await prisma.partner.update({
                    where: { id: partner.id },
                    data: { razorpayContactId: contactId }
                });
            }

            // Ensure Fund Account exists
            // Note: In a real app, we might want to regenerate this if bank details changed.
            // For now, we reuse or create if missing.
            let method = "BANK_TRANSFER";
            if (!fundAccountId) {
                const result = await getOrCreateFundAccount(contactId, partner);
                fundAccountId = result.fundAccountId;
                method = result.method;
                await prisma.partner.update({
                    where: { id: partner.id },
                    data: { razorpayFundAccountId: fundAccountId }
                });
            } else {
                // Determine method for the payout record
                method = partner.bankAccount ? "BANK_TRANSFER" : "UPI";
            }

            // 5. Execute Payout
            const idempotencyKey = uuidv4();
            const rzpPayout = await executeRazorpayPayout({
                fundAccountId,
                amount: payoutAmount,
                idempotencyKey,
                method
            });

            // 6. Create Payout Record in DB
            const payoutRecord = await prisma.payout.create({
                data: {
                    partnerId: partner.id,
                    amount: payoutAmount,
                    status: "PROCESSING",
                    method,
                    razorpayPayoutId: rzpPayout.id,
                    idempotencyKey,
                    logsCount: 0 // Will be handled if we map to ScanLogs
                }
            });

            console.log(`[PAYOUT:INIT] Partner=${partner.name} Amount=${payoutAmount} RZP_ID=${rzpPayout.id}`);

            return NextResponse.json({
                success: true,
                message: "Payout initiated successfully.",
                payout: payoutRecord
            });

        } catch (rzpError: any) {
            console.error("Razorpay Payout Error:", rzpError);
            
            // Log failure in DB
            await prisma.payout.create({
                data: {
                    partnerId: partner.id,
                    amount: payoutAmount,
                    status: "FAILED",
                    method: partner.bankAccount ? "BANK_TRANSFER" : "UPI",
                    failureReason: rzpError.message || "Razorpay API error",
                    logsCount: 0
                }
            });

            return NextResponse.json({ 
                error: "Failed to initiate Razorpay payout.", 
                details: rzpError.message || "Unknown error"
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Payout Initiation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
