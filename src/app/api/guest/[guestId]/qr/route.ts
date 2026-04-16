export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guestId: string }> }
) {
    try {
        const unwrappedParams = await params;
        const guestId = unwrappedParams.guestId;
        const prisma = getPrisma();

        if (!guestId) {
            return NextResponse.json({ error: "Guest ID required" }, { status: 400 });
        }

        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            include: { partner: true, dynamicQr: true }
        });

        if (!guest || !guest.dynamicQr) {
            return NextResponse.json({ error: "Guest or QR record not found" }, { status: 404 });
        }

        // Get referral frequency (settled visits)
        const referralCount = await prisma.scanLog.count({
            where: { guestId: guest.id }
        });

        // Generate the payload
        const timestamp = Date.now();
        const payload = {
            version: 1,
            guestId: guest.id,
            name: guest.name,
            mobile: guest.mobileNumber,
            partner: guest.partner.partnerCode,
            partnerName: guest.partner.name,
            discount: guest.partner.guestDiscountSlab,
            frequency: referralCount + 1,
            expiresAt: guest.dynamicQr.expiresAt.getTime(),
            timestamp: timestamp
        };

        // Sign the payload using the guest's unique secretKey to prevent spoofing
        // Using HMAC SHA256
        const stringifiedPayload = JSON.stringify(payload);
        const signature = crypto
            .createHmac('sha256', guest.dynamicQr.secretKey)
            .update(stringifiedPayload)
            .digest('hex');

        // The final QR data includes the payload and the signature
        const secureQrData = JSON.stringify({
            data: payload,
            signature: signature
        });

        // Check for redemption status
        const redemption = await prisma.scanLog.findFirst({
            where: { guestId: guest.id }
        });

        return NextResponse.json({
            success: true,
            secureQrData: secureQrData,
            isRedeemed: !!redemption,
            expiresAt: guest.dynamicQr.expiresAt,
            guestMeta: {
                name: guest.name,
                mobile: guest.mobileNumber,
                partnerName: guest.partner.name,
                partnerCode: guest.partner.partnerCode,
                discount: guest.partner.guestDiscountSlab,
                frequency: referralCount + 1,
                isExpired: new Date() > guest.dynamicQr.expiresAt
            }
        });

    } catch (error) {
        console.error("QR Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
