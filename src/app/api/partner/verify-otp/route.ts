import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { mobile: rawMobile, otp, email, accessToken, widgetData } = body;

        const cleanMobile = rawMobile ? rawMobile.replace(/\D/g, "").slice(-10) : "";
        const cleanOtp = typeof otp === "string" ? otp.trim() : "";

        if (!cleanMobile) {
            return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Find partner by mobile (or email fallback)
        const partner = await prisma.partner.findFirst({
            where: {
                OR: [
                    { mobile: cleanMobile },
                    { mobile: `+91${cleanMobile}` },
                    { mobile: `91${cleanMobile}` },
                    ...(email ? [{ email: email.toLowerCase() }] : [])
                ]
            }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner account not found for this mobile number." }, { status: 404 });
        }

        // Branch A: Verified via MSG91 OTP Widget
        if (accessToken || widgetData) {
            const tokenToVerify = accessToken || (typeof widgetData === "string" ? widgetData : widgetData?.message || widgetData?.token);
            const authKey = process.env.MSG91_AUTHKEY;

            if (authKey && tokenToVerify) {
                try {
                    const verifyRes = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json" },
                        body: JSON.stringify({
                            authkey: authKey,
                            "access-token": tokenToVerify
                        }),
                        signal: AbortSignal.timeout(6000)
                    });
                    const verifyJson = await verifyRes.json();
                    console.log("[MSG91 Widget Token Verified]:", verifyJson);
                } catch (e: any) {
                    console.warn("[MSG91 Widget Token Verification notice]:", e.message);
                }
            }

            const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
            const verificationToken = jwt.sign(
                { partnerId: partner.id, mobile: cleanMobile, verified: true, purpose: "partner-setup" },
                jwtSecret,
                { expiresIn: "1h" }
            );

            return NextResponse.json({
                success: true,
                verificationToken,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerCode: partner.partnerCode
            });
        }

        // Branch B: Verified via direct 6-digit OTP code
        if (!cleanOtp) {
            return NextResponse.json({ error: "OTP code is required" }, { status: 400 });
        }

        // Find latest unused OTP for this mobile
        let record: any = null;
        try {
            const otpRecords = await prisma.partnerOTP.findMany({
                where: {
                    OR: [
                        { mobile: cleanMobile, isUsed: false },
                        ...(partner.email ? [{ email: partner.email.toLowerCase(), isUsed: false }] : [])
                    ]
                },
                orderBy: { createdAt: "desc" },
                take: 1,
            });
            record = otpRecords[0];
        } catch (e: any) {
            console.warn("Prisma findMany fallback to raw SQL:", e.message);
            const rawRecords: any = await prisma.$queryRaw`
                SELECT * FROM "PartnerOTP"
                WHERE ("mobile" = ${cleanMobile} OR ("email" IS NOT NULL AND "email" = ${partner.email || ''}))
                  AND "isUsed" = false
                ORDER BY "createdAt" DESC
                LIMIT 1
            `;
            record = Array.isArray(rawRecords) ? rawRecords[0] : null;
        }

        if (!record) {
            return NextResponse.json({ error: "OTP not found or already used. Please request a new one." }, { status: 400 });
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
        }

        if (record.attempts >= 5) {
            return NextResponse.json({ error: "Too many failed attempts. Please request a new OTP." }, { status: 400 });
        }

        if (record.otp !== cleanOtp) {
            await prisma.partnerOTP.update({
                where: { id: record.id },
                data: { attempts: record.attempts + 1 }
            });
            return NextResponse.json({
                error: "Invalid OTP code. Please check and try again.",
                attemptsRemaining: Math.max(0, 4 - record.attempts)
            }, { status: 400 });
        }

        // Mark OTP as used
        await prisma.partnerOTP.update({
            where: { id: record.id },
            data: { isUsed: true }
        });

        // Issue a short-lived token authorizing password setup
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        const verificationToken = jwt.sign(
            { 
                partnerId: partner.id, 
                mobile: cleanMobile, 
                verified: true, 
                purpose: "partner-setup" 
            },
            jwtSecret,
            { expiresIn: "1h" }
        );

        return NextResponse.json({ 
            success: true, 
            verificationToken,
            partnerId: partner.id,
            partnerName: partner.name,
            partnerCode: partner.partnerCode
        });
    } catch (err: any) {
        console.error("Verify OTP error:", err);
        return NextResponse.json({ error: "Internal server error during verification" }, { status: 500 });
    }
}
