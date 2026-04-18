import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        // RBAC Check
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const rolePrefix = session.role === "SUPER_ADMIN" ? "/super-admin" : "/admin";

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        const prisma = getPrisma();
        const searchLower = query.toLowerCase();

        // Parallel search across multiple models
        const [partners, guests, payouts] = await Promise.all([
            prisma.partner.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { partnerCode: { contains: query, mode: 'insensitive' } },
                        { mobile: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5
            }),
            prisma.guest.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { mobileNumber: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5,
                include: { partner: { select: { name: true } } }
            }),
            prisma.payout.findMany({
                where: {
                    id: { contains: query, mode: 'insensitive' }
                },
                take: 3,
                include: { partner: { select: { name: true } } }
            })
        ]);

        const results = [
            ...partners.map((p: any) => ({
                id: p.id,
                type: "PARTNER",
                title: p.name,
                subtitle: p.partnerCode,
                href: `${rolePrefix}/partners?q=${p.partnerCode}`
            })),
            ...guests.map((g: any) => ({
                id: g.id,
                type: "GUEST",
                title: g.name,
                subtitle: `Ref by ${g.partner?.name || 'Unknown'}`,
                href: `${rolePrefix}/scan?q=${g.mobileNumber}`
            })),
            ...payouts.map((p: any) => ({
                id: p.id,
                type: "PAYOUT",
                title: `Payout ₹${p.amount}`,
                subtitle: p.partner?.name || 'Unknown',
                href: `${rolePrefix}/payouts?id=${p.id}`
            }))
        ];

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error("Global Search Error:", error);
        return NextResponse.json({ error: "Search Failed" }, { status: 500 });
    }
}
