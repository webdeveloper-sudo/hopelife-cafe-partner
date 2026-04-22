export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendMarketingInviteEmail } from "@/lib/email";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const prisma = getPrisma();
        const reps = await prisma.marketingRep.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { partners: true }
                }
            }
        });

        return NextResponse.json({ reps });
    } catch (err: any) {
        console.error("Fetch Marketing Team Error:", err);
        return NextResponse.json({ error: "Failed to fetch marketing team" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, mobile } = body;

        if (!name || !email || !mobile) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prisma = getPrisma();

        const existingEmail = await prisma.marketingRep.findUnique({ where: { email } });
        if (existingEmail) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }
        
        const existingMobile = await prisma.marketingRep.findUnique({ where: { mobile } });
        if (existingMobile) {
            return NextResponse.json({ error: "Mobile already exists" }, { status: 409 });
        }

        const placeholderPass = crypto.randomBytes(32).toString('hex');
        const hashedPassword = crypto.createHash("sha256").update(placeholderPass).digest("hex");

        const newRep = await prisma.marketingRep.create({
            data: {
                name,
                email,
                mobile,
                password: hashedPassword,
                status: "ACTIVE" // You can set active immediately because they need to set password anyway
            }
        });

        // Generate invitation token
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        const inviteToken = jwt.sign(
            { id: newRep.id, email: newRep.email, role: "MARKETING", type: "invitation" },
            jwtSecret,
            { expiresIn: "7d" }
        );

        // Send email using existing integrated configuration
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hopelife-cafe-partner.vercel.app";
        const setupLink = `${appUrl}/marketing/set-password?token=${inviteToken}`;
        
        try {
            await sendMarketingInviteEmail(newRep.email, newRep.name, setupLink);
        } catch (emailError) {
            console.error("Email Provider Error, Rep Created Anyway", emailError);
        }

        return NextResponse.json({ success: true, rep: newRep });
    } catch (err: any) {
        console.error("Create Marketing Rep Error:", err);
        return NextResponse.json({ error: "Failed to create marketing rep" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prisma = getPrisma();

        const updatedRep = await prisma.marketingRep.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, rep: updatedRep });
    } catch (err: any) {
        console.error("Update Marketing Rep Error:", err);
        return NextResponse.json({ error: "Failed to update marketing rep" }, { status: 500 });
    }
}
