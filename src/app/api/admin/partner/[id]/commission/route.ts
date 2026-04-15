import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

/**
 * Admin updates a partner's commission slab.
 * This is an ADMIN-only endpoint (enforced by middleware).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { commissionSlab, guestDiscountSlab } = await req.json();

        const updateData: any = {};
        if (commissionSlab !== undefined) {
            if (typeof commissionSlab !== "number" || commissionSlab < 1 || commissionSlab > 40) {
                return NextResponse.json({ error: "Commission must be between 1% and 40%." }, { status: 400 });
            }
            updateData.commissionSlab = commissionSlab;
        }

        if (guestDiscountSlab !== undefined) {
            if (typeof guestDiscountSlab !== "number" || guestDiscountSlab < 1 || guestDiscountSlab > 40) {
                return NextResponse.json({ error: "Discount must be between 1% and 40%." }, { status: 400 });
            }
            updateData.guestDiscountSlab = guestDiscountSlab;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No update data provided." }, { status: 400 });
        }

        const prisma = getPrisma();
        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) {
            return NextResponse.json({ error: "Partner not found." }, { status: 404 });
        }

        await prisma.partner.update({ where: { id }, data: updateData });

        return NextResponse.json({ success: true, ...updateData });
    } catch (err) {
        console.error("Commission update error:", err);
        return NextResponse.json({ error: "Failed to update commission." }, { status: 500 });
    }
}
