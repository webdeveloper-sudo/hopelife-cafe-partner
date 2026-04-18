import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ guestId: string }> }
) {
    try {
        const { guestId } = await params;
        const prisma = getPrisma();

        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            select: { isRedeemed: true }
        });

        if (!guest) {
            return NextResponse.json({ error: "Guest not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, isRedeemed: guest.isRedeemed });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
