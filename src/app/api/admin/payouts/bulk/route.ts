import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getOrCreateContact, getOrCreateFundAccount, executeRazorpayPayout, fetchBankingBalance } from "@/lib/razorpay";
import { v4 as uuidv4 } from "uuid";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const body = await req.json();
        const { partnerIds } = body;

        if (!partnerIds || !Array.isArray(partnerIds) || partnerIds.length === 0) {
            return NextResponse.json({ error: "A non-empty list of Partner IDs is required." }, { status: 400 });
        }

        const prisma = getPrisma() as any;
        const configModel = prisma.systemConfig || prisma.SystemConfig;
        
        // 1. Fetch Partners and Config
        const [partners, config] = await Promise.all([
            prisma.partner.findMany({ where: { id: { in: partnerIds } } }),
            configModel.findUnique({ where: { id: "GLOBAL" } })
        ]);

        const minAmount = config?.minPayoutAmount || 100;
        
        // 2. Pre-check Batch Total and Thresholds
        let totalBatchAmount = 0;
        const validPartners = [];
        const skippedPartners = [];

        for (const partnerId of partnerIds) {
            const partner = partners.find((p: any) => p.id === partnerId);
            if (!partner) {
                skippedPartners.push({ partnerId, error: "Partner not found" });
                continue;
            }

            if (partner.walletBalance < minAmount) {
                skippedPartners.push({ partnerId, name: partner.name, error: `Below threshold (₹${minAmount})` });
                continue;
            }

            totalBatchAmount += partner.walletBalance;
            validPartners.push(partner);
        }

        if (validPartners.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: "No partners meet the payout criteria.",
                skipped: skippedPartners 
            }, { status: 400 });
        }

        // 3. Razorpay Balance Verification (The whole batch total)
        const currentBalance = await fetchBankingBalance();
        if (currentBalance < totalBatchAmount) {
            return NextResponse.json({ 
                error: "Insufficient Razorpay gateway balance for the entire batch.",
                requiredTotal: totalBatchAmount,
                available: currentBalance
            }, { status: 400 });
        }

        const results: any[] = skippedPartners.map(s => ({ ...s, status: "SKIPPED" }));

        // 4. Execute Payouts for Valid Partners
        for (const partner of validPartners) {
            try {
                // Check local lock again just in case
                const activePayout = await prisma.payout.findFirst({
                    where: { partnerId: partner.id, status: "PROCESSING" }
                });
                if (activePayout) {
                    results.push({ partnerId: partner.id, partnerName: partner.name, status: "SKIPPED", error: "Payout in progress" });
                    continue;
                }

                const payoutAmount = partner.walletBalance;
                let contactId = partner.razorpayContactId;
                let fundAccountId = partner.razorpayFundAccountId;

                if (!contactId) {
                    contactId = await getOrCreateContact(partner);
                    await prisma.partner.update({ where: { id: partner.id }, data: { razorpayContactId: contactId } });
                }

                let method = "BANK_TRANSFER";
                if (!fundAccountId) {
                    const r = await getOrCreateFundAccount(contactId, partner);
                    fundAccountId = r.fundAccountId;
                    method = r.method;
                    await prisma.partner.update({ where: { id: partner.id }, data: { razorpayFundAccountId: fundAccountId } });
                } else {
                    method = partner.bankAccount ? "BANK_TRANSFER" : "UPI";
                }

                const idempotencyKey = uuidv4();
                const rzpPayout = await executeRazorpayPayout({
                    fundAccountId,
                    amount: payoutAmount,
                    idempotencyKey,
                    method
                });

                const payoutRecord = await prisma.payout.create({
                    data: {
                        partnerId: partner.id,
                        amount: payoutAmount,
                        status: "PROCESSING",
                        method,
                        razorpayPayoutId: rzpPayout.id,
                        idempotencyKey,
                        logsCount: 0
                    }
                });

                results.push({ partnerId: partner.id, partnerName: partner.name, status: "SUCCESS", payoutId: payoutRecord.id });

            } catch (err: any) {
                console.error(`Bulk Payout Error for partner ${partner.id}:`, err);
                results.push({ partnerId: partner.id, partnerName: partner.name, status: "FAILED", error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            totalInitiated: results.filter(r => r.status === "SUCCESS").length,
            results
        });

    } catch (error: any) {
        console.error("Bulk Payout API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

