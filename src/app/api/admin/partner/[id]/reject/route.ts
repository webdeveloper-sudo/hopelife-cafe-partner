import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const prisma = getPrisma();

        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        const updated = await prisma.partner.update({
            where: { id },
            data: { status: "REJECTED" }
        });

        return NextResponse.json({ success: true, partner: updated });
    } catch (err) {
        console.error("Reject partner error:", err);
        return NextResponse.json({ error: "Failed to reject partner." }, { status: 500 });
    }
}
