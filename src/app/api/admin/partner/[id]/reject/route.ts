import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

import { sendPartnerRejectionEmail } from "@/lib/email";

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { reason } = await req.json();
        const prisma = getPrisma();

        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        const updated = await prisma.partner.update({
            where: { id },
            data: { status: "REJECTED" }
        });

        // Send rejection email
        if (partner.email) {
            await sendPartnerRejectionEmail(partner.email, partner.name, reason || "Application does not meet our current requirements.");
        }

        return NextResponse.json({ success: true, partner: updated });
    } catch (err) {
        console.error("Reject partner error:", err);
        return NextResponse.json({ error: "Failed to reject partner." }, { status: 500 });
    }
}
