import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

// Admin updates a partner's commission slab
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { commissionSlab } = await req.json();

        if (typeof commissionSlab !== "number" || commissionSlab < 1 || commissionSlab > 30) {
            return NextResponse.json({ error: "Commission must be between 1% and 30%." }, { status: 400 });
        }

        const prisma = getPrisma();
        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) {
            return NextResponse.json({ error: "Partner not found." }, { status: 404 });
        }

        await prisma.partner.update({ where: { id }, data: { commissionSlab } });

        return NextResponse.json({ success: true, commissionSlab });
    } catch (err) {
        console.error("Commission update error:", err);
        return NextResponse.json({ error: "Failed to update commission." }, { status: 500 });
    }
}
