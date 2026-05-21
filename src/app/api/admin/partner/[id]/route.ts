import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

/**
 * Admin deletes a partner completely.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const prisma = getPrisma();

        // Check if partner exists
        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) {
            return NextResponse.json({ error: "Partner not found." }, { status: 404 });
        }

        // Delete related records manually since cascade is not in schema
        // Order matters for FK constraints
        
        // 1. Delete scan logs of all guests of this partner
        const partnerGuests = await prisma.guest.findMany({
            where: { partnerId: id },
            select: { id: true }
        });
        const guestIds = partnerGuests.map((g: { id: string }) => g.id);
        
        await prisma.scanLog.deleteMany({
            where: { guestId: { in: guestIds } }
        });
        
        // 2. Delete DynamicQRs of all guests
        await prisma.dynamicQR.deleteMany({
            where: { guestId: { in: guestIds } }
        });
        
        // 3. Delete guests
        await prisma.guest.deleteMany({
            where: { partnerId: id }
        });
        
        // 4. Delete Payouts
        await prisma.payout.deleteMany({
            where: { partnerId: id }
        });
        
        // 5. Delete IncomeLogs
        await prisma.incomeLog.deleteMany({
            where: { partnerId: id }
        });

        // 6. Finally delete the partner
        await prisma.partner.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: "Partner and all associated data removed successfully."
        });
    } catch (err: any) {
        console.error("Partner deletion error:", err);
        return NextResponse.json({ error: "Failed to remove partner.", details: err.message }, { status: 500 });
    }
}
