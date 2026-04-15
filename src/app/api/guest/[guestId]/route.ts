import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ guestId: string }> }) {
    try {
        const { guestId } = await params;
        const prisma = getPrisma();
        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            include: { partner: true }
        });

        if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

        return NextResponse.json({
            mobile: guest.mobileNumber,
            name: guest.name,
            partnerName: guest.partner.name,
            partnerCode: guest.partner.partnerCode,
            commissionSlab: guest.partner.commissionSlab
        });
    } catch (error) {
        console.error("Fetch Guest Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
