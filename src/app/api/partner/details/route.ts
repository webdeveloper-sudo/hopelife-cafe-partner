import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const prisma = getPrisma();
        const partner = await prisma.partner.findUnique({
            where: { partnerCode: code },
            select: {
                name: true,
                guestDiscountSlab: true
            }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            name: partner.name,
            discount: partner.guestDiscountSlab
        });
    } catch (error) {
        console.error("Partner Details API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
