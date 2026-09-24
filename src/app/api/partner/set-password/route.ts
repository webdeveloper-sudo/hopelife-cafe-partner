import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, mobile, email, password, confirmPassword } = body;

        if (!token || !password) {
            return NextResponse.json({ error: "Verification token and password are required." }, { status: 400 });
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
        }

        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        let decoded: any;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch {
            return NextResponse.json({ error: "Verification token expired or invalid. Please verify via WhatsApp OTP again." }, { status: 401 });
        }

        if (decoded.purpose !== "partner-setup" && decoded.purpose !== "set-password") {
            return NextResponse.json({ error: "Invalid token purpose." }, { status: 401 });
        }

        const prisma = getPrisma();

        // Find partner by token's partnerId, or by mobile/email
        const partner = await prisma.partner.findFirst({
            where: {
                OR: [
                    ...(decoded.partnerId ? [{ id: decoded.partnerId }] : []),
                    ...(mobile ? [{ mobile: mobile.replace(/\D/g, "").slice(-10) }] : []),
                    ...(email ? [{ email: email.toLowerCase() }] : [])
                ]
            }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner account not found." }, { status: 404 });
        }

        // Fetch system config
        const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
        const maintenanceMode = config?.maintenanceMode ?? false;
        const welcomeBonus = config?.welcomeBonus ?? 500;

        const isFirstTimeSetup = !partner.password;
        const walletIncrement = (isFirstTimeSetup && !maintenanceMode && partner.walletBalance === 0) ? welcomeBonus : 0;

        // Hash and save password & set status to ACTIVE
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        await prisma.partner.update({
            where: { id: partner.id },
            data: { 
                password: hashedPassword,
                status: "ACTIVE", // Activate account on password creation
                ...(walletIncrement > 0 ? { 
                    walletBalance: { increment: walletIncrement },
                    bonusAmount: { increment: walletIncrement },
                    walletTotal: { increment: walletIncrement },
                    incomeLogs: {
                        create: {
                            amount: walletIncrement,
                            type: "WELCOME_BONUS",
                            description: "Welcome bonus for completing account setup"
                        }
                    }
                } : {})
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Password set successfully! Your account is now active.",
            partnerCode: partner.partnerCode
        });
    } catch (err: any) {
        console.error("Set password error:", err);
        return NextResponse.json({ error: "Failed to set password." }, { status: 500 });
    }
}
