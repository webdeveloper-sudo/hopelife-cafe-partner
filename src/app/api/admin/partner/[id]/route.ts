import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

/**
 * Super Admin updates partner details.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Access Denied: Super Admin privileges required." }, { status: 403 });
        }

        const { id } = await params;
        const prisma = getPrisma();

        const existingPartner = await prisma.partner.findUnique({ where: { id } });
        if (!existingPartner) {
            return NextResponse.json({ error: "Partner not found." }, { status: 404 });
        }

        const body = await req.json();
        const {
            name,
            contactName,
            mobile,
            email,
            businessType,
            address,
            city,
            pincode,
            upiId,
            status,
            currentTier,
            referralGoal,
            commissionSlab,
            guestDiscountSlab,
            registeredByMarketingRepId,
            referredBy
        } = body;

        // Validation for required fields if provided
        if (name !== undefined && !name.trim()) {
            return NextResponse.json({ error: "Partner name cannot be empty." }, { status: 400 });
        }

        if (mobile !== undefined) {
            const cleanMobile = mobile.trim();
            if (!cleanMobile) {
                return NextResponse.json({ error: "Mobile number cannot be empty." }, { status: 400 });
            }
            if (cleanMobile !== existingPartner.mobile) {
                const dupMobile = await prisma.partner.findFirst({
                    where: { mobile: cleanMobile, id: { not: id } }
                });
                if (dupMobile) {
                    return NextResponse.json({ error: "Mobile number is already registered to another partner." }, { status: 409 });
                }
            }
        }

        if (email !== undefined && email) {
            const cleanEmail = email.trim().toLowerCase();
            if (cleanEmail !== existingPartner.email?.toLowerCase()) {
                const dupEmail = await prisma.partner.findFirst({
                    where: { email: cleanEmail, id: { not: id } }
                });
                if (dupEmail) {
                    return NextResponse.json({ error: "Email address is already registered to another partner." }, { status: 409 });
                }
            }
        }

        // Validate Marketing Rep if passed
        if (registeredByMarketingRepId) {
            const rep = await prisma.marketingRep.findUnique({
                where: { id: registeredByMarketingRepId }
            });
            if (!rep) {
                return NextResponse.json({ error: "Selected Marketing Representative does not exist." }, { status: 400 });
            }
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (contactName !== undefined) updateData.contactName = contactName ? contactName.trim() : null;
        if (mobile !== undefined) updateData.mobile = mobile.trim();
        if (email !== undefined) updateData.email = email ? email.trim().toLowerCase() : null;
        if (businessType !== undefined) updateData.businessType = businessType || null;
        if (address !== undefined) updateData.address = address || null;
        if (city !== undefined) updateData.city = city || null;
        if (pincode !== undefined) updateData.pincode = pincode || null;
        if (upiId !== undefined) updateData.upiId = upiId ? upiId.trim() : null;
        if (status !== undefined) updateData.status = status;
        if (currentTier !== undefined) updateData.currentTier = currentTier;
        if (referralGoal !== undefined) updateData.referralGoal = parseInt(referralGoal) || 10;
        if (commissionSlab !== undefined) updateData.commissionSlab = parseFloat(commissionSlab) || 7.5;
        if (guestDiscountSlab !== undefined) updateData.guestDiscountSlab = parseFloat(guestDiscountSlab) || 7.5;
        if (registeredByMarketingRepId !== undefined) {
            updateData.registeredByMarketingRepId = registeredByMarketingRepId || null;
        }
        if (referredBy !== undefined) updateData.referredBy = referredBy || null;

        const updatedPartner = await prisma.partner.update({
            where: { id },
            data: updateData,
            include: {
                registeredByMarketingRep: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Partner details updated successfully.",
            partner: updatedPartner
        });
    } catch (err: any) {
        console.error("Partner update error:", err);
        return NextResponse.json({ error: "Failed to update partner.", details: err.message }, { status: 500 });
    }
}

/**
 * Super Admin deletes a partner completely.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Access Denied: Super Admin privileges required." }, { status: 403 });
        }

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
