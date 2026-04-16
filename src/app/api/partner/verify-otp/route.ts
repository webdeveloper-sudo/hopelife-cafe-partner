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

        // Find latest unused OTP for this email
        const otpRecords = await prisma.partnerOTP.findMany({
            where: { email: email.toLowerCase(), isUsed: false },
            orderBy: { createdAt: "desc" },
            take: 1,
        });

        const record = otpRecords[0];

        if (!record) {
            return NextResponse.json({ error: "OTP not found or already used. Request a new one." }, { status: 400 });
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
        }

        if (record.attempts >= 5) {
            return NextResponse.json({ error: "Too many failed attempts. Please request a new OTP." }, { status: 400 });
        }

        if (record.otp !== otp.trim()) {
            await prisma.partnerOTP.update({
                where: { id: record.id },
                data: { attempts: record.attempts + 1 }
            });
            return NextResponse.json({
                error: "Invalid OTP. Please try again.",
                attemptsRemaining: 5 - (record.attempts + 1)
            }, { status: 400 });
        }

        // Mark as used
        await prisma.partnerOTP.update({
            where: { id: record.id },
            data: { isUsed: true }
        });

        // Issue a short-lived token authorising registration
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        const verificationToken = jwt.sign(
            { email: email.toLowerCase(), verified: true, purpose: "partner-registration" },
            jwtSecret,
            { expiresIn: "30m" }
        );

        return NextResponse.json({ success: true, verificationToken });
    } catch (err) {
        console.error("Verify OTP error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
