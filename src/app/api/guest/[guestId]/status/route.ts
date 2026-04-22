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
            include: {
                scanLogs: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            }
        });

        if (!guest) {
            return NextResponse.json({ error: "Guest not found" }, { status: 404 });
        }

        let billAmount = 0;
        let discount = 0;
        if (guest.isRedeemed && guest.scanLogs.length > 0) {
            billAmount = guest.scanLogs[0].billAmount || 0;
            discount = guest.scanLogs[0].guestDiscountAmount || guest.scanLogs[0].discountAmount || 0;
        }

        return NextResponse.json({ 
            success: true, 
            isRedeemed: guest.isRedeemed,
            billAmount,
            discount
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
