export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prisma = getPrisma();
        const { role, mobile, email, password } = body;

        if (role === "ADMIN" || role === "SUPER_ADMIN") {
            const adminUser = await prisma.admin.findUnique({ where: { email } });
            
            if (!adminUser) {
                return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
            }
            
            const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
            if (adminUser.password !== hashedPassword) {
                return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
            }

            // Return the actual role from the database — let the client-side decide if it matches
            const adminRole = adminUser.role || "SUPER_ADMIN";
            const redirectUrl = adminRole === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/admin/dashboard";

            await login({ role: adminRole, id: adminUser.id });
            return NextResponse.json({ success: true, role: adminRole, redirectUrl });

        } else if (role === "PARTNER") {
            const partner = (email) ?
                await prisma.partner.findFirst({ where: { email: email } }) :
                await prisma.partner.findUnique({ where: { mobile: mobile } });

            if (!partner) {
                return NextResponse.json({ error: "Partner account not found" }, { status: 404 });
            }

            // Secure Hashed Password Verification
            if (partner.password) {
                const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
                if (partner.password !== hashedPassword) {
                    return NextResponse.json({ error: "Invalid partner credentials" }, { status: 401 });
                }
            } else {
                console.warn(`[SECURITY] Partner ${partner.id} logged in without password hash.`);
            }

            await login({ role: "PARTNER", id: partner.id, partnerCode: partner.partnerCode });
            return NextResponse.json({ success: true, redirectUrl: "/dashboard", partnerCode: partner.partnerCode });
        }

        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });

    } catch (error: any) {
        console.error("Login Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
