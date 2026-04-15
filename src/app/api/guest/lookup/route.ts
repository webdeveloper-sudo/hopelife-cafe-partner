import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

// Public endpoint — no auth required. Guests use this to find their pass by mobile number.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile")?.trim();

    if (!mobile || !/^\d{10}$/.test(mobile)) {
        return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    try {
        const prisma = getPrisma();
        const guest = await prisma.guest.findUnique({ where: { mobileNumber: mobile } });

        if (!guest) {
            return NextResponse.json({ error: "No pass found for this number. Register with a partner first." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            guestId: guest.id,
            name: guest.name,
            passUrl: `/pass/${guest.id}`
        });
    } catch (err) {
        console.error("Guest lookup error:", err);
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}
