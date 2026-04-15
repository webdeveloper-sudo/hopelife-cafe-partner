import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const prisma = getPrisma();
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Step 1: Fetch all guests created in the last 24 hours
        const recentGuests = await prisma.guest.findMany({
            where: {
                createdAt: { gte: since }
            },
            include: { partner: true }
        });

        // Step 2: Fetch all settled scanLogs from the same window
        const settledLogs = await prisma.scanLog.findMany({
            where: { status: "SETTLED" }
        });
        const settledGuestIds = new Set(settledLogs.map((l: any) => l.guestId));

        // Step 3: Filter out guests who already have a settled scan
        const unsettledGuests = recentGuests
            .filter((g: any) => !settledGuestIds.has(g.id))
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);

        // Map to a cleaner format for the frontend
        const latestReferrals = unsettledGuests.map((guest: any) => ({
            id: guest.id,
            name: guest.name,
            mobile: guest.mobileNumber,
            partnerName: guest.partner?.name ?? 'Unknown',
            timeAgo: getRelativeTime(new Date(guest.createdAt))
        }));

        return NextResponse.json({ success: true, arrivals: latestReferrals });
    } catch (error) {
        console.error("Failed to fetch incoming referrals:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Simple relative time helper
function getRelativeTime(date: Date) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const elapsed = date.getTime() - Date.now();

    // in minutes
    if (Math.abs(elapsed) < 60 * 60 * 1000) {
        return rtf.format(Math.round(elapsed / (60 * 1000)), 'minute');
    }
    // in hours
    return rtf.format(Math.round(elapsed / (60 * 60 * 1000)), 'hour');
}
