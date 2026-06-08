import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Find the active OTP record
        const otpRecord = await prisma.partnerOTP.findFirst({
            where: {
                email: email.toLowerCase(),
                otp,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (!otpRecord) {
            return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 });
        }

        // Mark OTP as used
        await prisma.partnerOTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });

        // Generate reset token
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        const resetToken = jwt.sign(
            { email: email.toLowerCase(), purpose: "forgot-password-reset" },
            jwtSecret,
            { expiresIn: "15m" }
        );

        return NextResponse.json({ success: true, resetToken });
    } catch (err) {
        console.error("Forgot password verify OTP error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
