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
        } else if (session.role === "MARKETING") {
            const prisma = getPrisma();
            const rep = await prisma.marketingRep.findUnique({
                where: { id: session.id },
                select: { status: true }
            });
            if (!rep || rep.status !== "ACTIVE") {
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                cookieStore.delete("session");
                return NextResponse.json({ authenticated: false, error: "Account deactivated" }, { status: 401 });
            }
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
