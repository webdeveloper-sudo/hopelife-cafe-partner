import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

/**
 * Admin deletes a marketing team member completely.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const prisma = getPrisma();

        // Check if rep exists
        const rep = await prisma.marketingRep.findUnique({ where: { id } });
        if (!rep) {
            return NextResponse.json({ error: "Marketing team member not found." }, { status: 404 });
        }

        // When deleting a marketing rep, we just need to set the registeredByMarketingRepId 
        // in their partners to null, so we don't break the partners' data.
        await prisma.partner.updateMany({
            where: { registeredByMarketingRepId: id },
            data: { registeredByMarketingRepId: null }
        });

        // Finally delete the rep
        await prisma.marketingRep.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: "Marketing team member removed successfully."
        });
    } catch (err: any) {
        console.error("Marketing rep deletion error:", err);
        return NextResponse.json({ error: "Failed to remove marketing team member.", details: err.message }, { status: 500 });
    }
}
