import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const { email, resetToken, password, confirmPassword } = await req.json();

        if (!email || !resetToken || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Find the partner
        const partner = await prisma.partner.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner account not found." }, { status: 404 });
        }

        // Verify token
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        let decoded: any;
        try {
            decoded = jwt.verify(resetToken, jwtSecret);
        } catch {
            return NextResponse.json({ error: "Session expired or invalid. Please try again." }, { status: 401 });
        }

        if (decoded.email !== email.toLowerCase() || decoded.purpose !== "forgot-password-reset") {
            return NextResponse.json({ error: "Invalid reset token." }, { status: 401 });
        }

        // Hash and save new password
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        await prisma.partner.update({
            where: { id: partner.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Forgot password reset error:", err);
        return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
    }
}
