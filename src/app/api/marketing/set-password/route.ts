export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        
        let decoded: any;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            return NextResponse.json({ error: "Invalid or expired invitation token" }, { status: 400 });
        }

        if (decoded.type !== "invitation" || decoded.role !== "MARKETING") {
            return NextResponse.json({ error: "Invalid token type" }, { status: 400 });
        }

        const prisma = getPrisma();
        
        const rep = await prisma.marketingRep.findUnique({
            where: { id: decoded.id }
        });

        if (!rep) {
            return NextResponse.json({ error: "Marketing representative not found" }, { status: 404 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

        await prisma.marketingRep.update({
            where: { id: rep.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Set Password Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
