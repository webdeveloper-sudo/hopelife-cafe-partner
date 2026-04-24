import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.partnerCode) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const prisma = getPrisma();

        // Allowed fields for partner editing
        const allowedFields = [
            "name", "contactName", "address", "city", "pincode", "upiId", "mobile"
        ];

        const updateData: any = {};
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        const updatedPartner = await prisma.partner.update({
            where: { partnerCode: session.partnerCode },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            partner: {
                name: updatedPartner.name,
                contactName: updatedPartner.contactName,
                email: updatedPartner.email,
                mobile: updatedPartner.mobile,
                upiId: updatedPartner.upiId,
                address: updatedPartner.address,
                city: updatedPartner.city,
                pincode: updatedPartner.pincode
            }
        });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
    }
}
