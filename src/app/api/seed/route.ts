import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
    try {
        const prisma = getPrisma();
        
        const email = "admin@achariya.org";
        const password = "123";
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

        const admin = await prisma.admin.upsert({
            where: { email },
            update: { password: hashedPassword, name: "System Admin" },
            create: {
                email,
                password: hashedPassword,
                name: "System Admin",
            },
        });

        return NextResponse.json({ success: true, admin });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}
