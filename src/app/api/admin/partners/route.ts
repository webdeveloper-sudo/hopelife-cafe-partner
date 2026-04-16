import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const prisma = getPrisma();
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                partnerCode: true,
                name: true,
                contactName: true,
                mobile: true,
                email: true,
                status: true,
                businessType: true,
                address: true,
                city: true,
                pincode: true,
                commissionSlab: true,
                guestDiscountSlab: true,
                walletBalance: true,
                createdAt: true,
            }
        });
        return NextResponse.json(partners);
    } catch (err) {
        console.error("Fetch partners error:", err);
        return NextResponse.json({ error: "Failed to fetch partners." }, { status: 500 });
    }
}
