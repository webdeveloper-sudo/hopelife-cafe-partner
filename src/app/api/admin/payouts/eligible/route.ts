import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const prisma = getPrisma();

        // Find ACTIVE partners with walletBalance > 0
        const partners = await prisma.partner.findMany({
            where: {
                status: "ACTIVE",
                walletBalance: { gt: 0 }
            },
            include: {
                payouts: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            }
        });

        // For each partner, check for any ongoing (PROCESSING) payout
        const processingPayouts = await prisma.payout.findMany({
            where: {
                status: "PROCESSING"
            },
            select: {
                partnerId: true
            }
        });

        const processingPartnerIds = new Set(processingPayouts.map((p: any) => p.partnerId));

        const eligiblePartners = partners.map((p: any) => {
            const hasBank = p.bankAccount && p.ifsc;
            const hasUpi = !!p.upiId;
            
            return {
                id: p.id,
                name: p.name,
                partnerCode: p.partnerCode,
                walletBalance: p.walletBalance,
                lastPayoutDate: p.payouts[0]?.createdAt || null,
                isProcessing: processingPartnerIds.has(p.id),
                payoutMethod: hasBank ? "BANK_TRANSFER" : hasUpi ? "UPI" : "NONE",
                hasPayoutDetails: hasBank || hasUpi,
                bankName: p.bankName,
                accountHolderName: p.accountHolderName,
                upiId: p.upiId
            };
        });

        return NextResponse.json({
            success: true,
            partners: eligiblePartners
        });

    } catch (error: any) {
        console.error("Eligible Payouts API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
