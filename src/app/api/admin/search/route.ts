import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        // RBAC Check
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Admin personnel only." }, { status: 403 });
        }

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
                        { name: { contains: query } },
                        { partnerCode: { contains: query } },
                        { mobile: { contains: query } }
                    ]
                },
                take: 5
            }),
            prisma.guest.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { mobileNumber: { contains: query } }
                    ]
                },
                take: 5,
                include: { partner: { select: { name: true } } }
            }),
            prisma.payout.findMany({
                where: {
                    id: { contains: query }
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
                href: `/admin/partners?q=${p.partnerCode}`
            })),
            ...guests.map((g: any) => ({
                id: g.id,
                type: "GUEST",
                title: g.name,
                subtitle: `Ref by ${g.partner.name}`,
                href: `/admin/scan?q=${g.mobileNumber}`
            })),
            ...payouts.map((p: any) => ({
                id: p.id,
                type: "PAYOUT",
                title: `Payout ₹${p.amount}`,
                subtitle: p.partner.name,
                href: `/admin/payouts?id=${p.id}`
            }))
        ];

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error("Global Search Error:", error);
        return NextResponse.json({ error: "Search Failed" }, { status: 500 });
    }
}
