import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const prisma = getPrisma();

        // Find ACTIVE partners with walletBalance > 0
        const partners = await prisma.partner.findMany({
            where: {
                status: "ACTIVE",
                walletBalance: { gt: 0 }
            },
            orderBy: {
                walletBalance: "desc"
            }
        });

        const eligiblePartners = partners.map((p: any) => {
            return {
                id: p.id,
                name: p.name,
                partnerCode: p.partnerCode,
                walletBalance: p.walletBalance,
                upiId: p.upiId,
                hasPayoutDetails: !!p.upiId,
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
