import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "PARTNER") {
            return NextResponse.json({ error: "Unauthorized. Partner access required." }, { status: 403 });
        }

        const partnerId = session.id;
        const prisma = getPrisma();

        const payouts = await prisma.payout.findMany({
            where: { partnerId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                amount: true,
                status: true,
                method: true,
                razorpayPayoutId: true,
                failureReason: true,
                settledAt: true,
                createdAt: true
            }
        });

        // Get current wallet balance too
        const partner = await prisma.partner.findUnique({
            where: { id: partnerId },
            select: { walletBalance: true }
        });

        return NextResponse.json({
            success: true,
            walletBalance: partner?.walletBalance || 0,
            payouts
        });

    } catch (error: any) {
        console.error("Partner Payouts API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
