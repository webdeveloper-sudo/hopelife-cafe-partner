import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendPartnerOTPEmail } from "@/lib/email";

export const runtime = 'nodejs';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Check if an ACTIVE partner with this email already exists
        const existingPartner = await prisma.partner.findFirst({
            where: { email: email.toLowerCase(), status: "ACTIVE" }
        });
        if (existingPartner) {
            return NextResponse.json({ error: "An account with this email already exists. Please login." }, { status: 409 });
        }

        // Invalidate old OTPs
        await prisma.partnerOTP.updateMany({
            where: { email: email.toLowerCase(), isUsed: false },
            data: { isUsed: true }
        });

        // Generate + save new OTP
        const otp = generateOTP();
        await prisma.partnerOTP.create({
            data: {
                email: email.toLowerCase(),
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
            }
        });

        const sent = await sendPartnerOTPEmail(email, otp);
        if (!sent) {
            return NextResponse.json({ error: "Failed to send OTP email. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `OTP sent to ${email}` });
    } catch (err) {
        console.error("Send OTP error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
