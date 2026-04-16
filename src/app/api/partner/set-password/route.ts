import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const { token, email, password, confirmPassword } = await req.json();

        if (!token || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Look up partner by set-password token
        const partner = await prisma.partner.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner account not found." }, { status: 404 });
        }
        if (partner.status !== "ACTIVE") {
            return NextResponse.json({ error: "Your account is not yet approved." }, { status: 403 });
        }

        // Validate token (JWT signed with partner id + secret)
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        let decoded: any;
        try {
            const jwt = await import("jsonwebtoken");
            decoded = jwt.default.verify(token, jwtSecret);
        } catch {
            return NextResponse.json({ error: "This link has expired. Please contact admin for a new link." }, { status: 401 });
        }

        if (decoded.partnerId !== partner.id || decoded.purpose !== "set-password") {
            return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
        }

        // Hash and save password
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        await prisma.partner.update({
            where: { id: partner.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Set password error:", err);
        return NextResponse.json({ error: "Failed to set password." }, { status: 500 });
    }
}
