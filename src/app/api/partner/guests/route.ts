export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const prisma = getPrisma();
        const session = await getSession();

        if (!session || session.role !== "PARTNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const partnerCode = session.partnerCode as string;
        const partner = await prisma.partner.findUnique({
            where: { partnerCode }
        });

        if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

        // Get all guests for this partner
        const guests = await prisma.guest.findMany({
            where: { partnerId: partner.id },
            include: {
                _count: {
                    select: { scanLogs: true }
                },
                scanLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedGuests = guests.map((g: any) => ({
            id: g.id,
            name: g.name,
            mobile: g.mobileNumber,
            date: new Date(g.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            referralCount: g._count.scanLogs,
            lastVisit: g.scanLogs[0] ? new Date(g.scanLogs[0].createdAt).toLocaleDateString('en-GB') : 'No visits yet',
            status: g._count.scanLogs > 0 ? "Confirmed" : "Sent"
        }));

        return NextResponse.json({
            success: true,
            guests: formattedGuests
        });

    } catch (error) {
        console.error("Partner Guests API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
