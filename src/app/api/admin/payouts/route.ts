import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const prisma = getPrisma();

        const payouts = await prisma.payout.findMany({
            include: {
                partner: {
                    select: {
                        name: true,
                        partnerCode: true,
                        upiId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map to format suitable for the UI table
        const formattedPayouts = payouts.map((p: any) => ({
            id: p.id.slice(0, 8).toUpperCase(), 
            partner: p.partner.name,
            partnerCode: p.partner.partnerCode,
            amount: p.amount,
            date: new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
            method: p.method,
            status: p.status,
            settledAt: p.settledAt,
            upiId: p.partner.upiId || "N/A"
        }));

        return NextResponse.json({
            success: true,
            payouts: formattedPayouts
        });
    } catch (error: any) {
        console.error("Fetch Payouts Error:", error);
        return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
    }
}
