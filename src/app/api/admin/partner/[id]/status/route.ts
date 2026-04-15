import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

/**
 * Admin updates a partner's status (ACTIVE, REJECTED, etc.).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!status || !["ACTIVE", "REJECTED", "PENDING"].includes(status)) {
            return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
        }

        const prisma = getPrisma();
        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) {
            return NextResponse.json({ error: "Partner not found." }, { status: 404 });
        }

        await prisma.partner.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({
            success: true,
            message: `Partner status updated to ${status}`,
            partnerId: id,
            status
        });
    } catch (err: any) {
        console.error("Status update error:", err);
        return NextResponse.json({ error: "Failed to update partner status.", details: err.message }, { status: 500 });
    }
}
