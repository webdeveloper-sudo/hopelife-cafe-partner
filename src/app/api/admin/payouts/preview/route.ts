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
        const { partnerIds } = body;

        if (!partnerIds || !Array.isArray(partnerIds)) {
            return NextResponse.json({ error: "Partner IDs list is required." }, { status: 400 });
        }

        const prisma = getPrisma();
        
        const partners = await prisma.partner.findMany({
            where: {
                id: { in: partnerIds }
            },
            select: {
                id: true,
                name: true,
                walletBalance: true,
                upiId: true
            }
        });

        const previewData = partners.map((p: any) => {
            const hasPayoutDetails = !!p.upiId;
            const balance = p.walletBalance || 0;
            
            return {
                id: p.id,
                name: p.name,
                amount: balance,
                method: p.upiId ? "UPI" : "MISSING",
                status: balance <= 0 ? "ZERO_BALANCE" : (hasPayoutDetails ? "READY" : "MISSING_DETAILS"),
                canSettle: balance > 0 && hasPayoutDetails
            };
        });

        const totalAmount = previewData.reduce((sum: number, p: any) => p.canSettle ? sum + p.amount : sum, 0);
        const readyCount = previewData.filter((p: any) => p.canSettle).length;

        return NextResponse.json({
            success: true,
            summary: {
                totalCount: previewData.length,
                readyCount,
                totalAmount
            },
            partners: previewData
        });

    } catch (error: any) {
        console.error("Payout Preview API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
