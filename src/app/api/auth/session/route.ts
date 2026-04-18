import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        let extraData = {};
        if (session.role === "PARTNER") {
            const prisma = getPrisma();
            const partner = await prisma.partner.findUnique({
                where: { id: session.id },
                select: { partnerCode: true }
            });
            extraData = { partnerCode: partner?.partnerCode };
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: session.id,
                role: session.role,
                ...extraData
            }
        });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}
