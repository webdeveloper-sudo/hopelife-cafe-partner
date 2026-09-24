import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendWhatsAppOTP } from "@/lib/msg91";

export const runtime = 'nodejs';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rawMobile = body.mobile;

        if (!rawMobile || typeof rawMobile !== "string") {
            return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
        }

        const cleanMobile = rawMobile.replace(/\D/g, "").slice(-10);
        if (cleanMobile.length !== 10) {
            return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
        }

        const prisma = getPrisma();

        // Find partner by mobile
        const partner = await prisma.partner.findFirst({
            where: {
                OR: [
                    { mobile: cleanMobile },
                    { mobile: `+91${cleanMobile}` },
                    { mobile: `91${cleanMobile}` }
                ]
            }
        });

        if (!partner) {
            return NextResponse.json({ 
                error: "No partner account found with this mobile number. Please register first." 
            }, { status: 404 });
        }

        // Invalidate previous unused OTPs for this mobile
        try {
            await prisma.partnerOTP.updateMany({
                where: {
                    mobile: cleanMobile,
                    isUsed: false
                },
                data: { isUsed: true }
            });
        } catch (e: any) {
            console.warn("Prisma updateMany fallback to raw SQL:", e.message);
            await prisma.$executeRaw`
                UPDATE "PartnerOTP"
                SET "isUsed" = true
                WHERE ("mobile" = ${cleanMobile} OR ("email" IS NOT NULL AND "email" = ${partner.email || ''}))
                  AND "isUsed" = false
            `;
        }

        // Generate 6-digit OTP and store
        const otp = generateOTP();
        try {
            await prisma.partnerOTP.create({
                data: {
                    mobile: cleanMobile,
                    email: partner.email || null,
                    otp,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                    isUsed: false,
                    attempts: 0
                }
            });
        } catch (e: any) {
            console.warn("Prisma create fallback to raw SQL:", e.message);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await prisma.$executeRaw`
                INSERT INTO "PartnerOTP" ("id", "mobile", "email", "otp", "expiresAt", "isUsed", "attempts", "createdAt")
                VALUES (gen_random_uuid(), ${cleanMobile}, ${partner.email || null}, ${otp}, ${expiresAt}, false, 0, NOW())
            `;
        }

        // Dispatch via MSG91 WhatsApp OTP
        const sendResult = await sendWhatsAppOTP(cleanMobile, otp);
        if (!sendResult.success) {
            return NextResponse.json({ 
                error: sendResult.error || "Failed to deliver WhatsApp OTP. Please check your MSG91 configuration or ensure your number is on WhatsApp." 
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: sendResult.message || `OTP sent to your WhatsApp number (+91 ${cleanMobile})`,
            mobile: cleanMobile,
            partnerName: partner.name,
            simulated: false
        });
    } catch (err: any) {
        console.error("Send WhatsApp OTP error:", err);
        return NextResponse.json({ error: "Internal server error while sending OTP" }, { status: 500 });
    }
}
