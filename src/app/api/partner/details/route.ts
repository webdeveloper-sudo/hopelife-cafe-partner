import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const prisma = getPrisma();
        const cleanCode = code.trim();

        const partner = await prisma.partner.findFirst({
            where: {
                OR: [
                    { partnerCode: cleanCode },
                    { partnerCode: cleanCode.toUpperCase() },
                    { partnerCode: cleanCode.toLowerCase() },
                    { id: cleanCode }
                ]
            },
            select: {
                name: true,
                partnerCode: true,
                guestDiscountSlab: true,
                status: true
            }
        });

        if (!partner) {
            if (cleanCode.toLowerCase() === "demo") {
                const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
                return NextResponse.json({
                    success: true,
                    name: "Grand Hope Cafe (Demo)",
                    code: "demo",
                    status: "ACTIVE",
                    discount: config?.baseGuestDiscount || 7.5
                });
            }
            return NextResponse.json({ error: `Partner not found with code: ${cleanCode}` }, { status: 404 });
        }

        const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });

        return NextResponse.json({
            success: true,
            name: partner.name,
            code: partner.partnerCode,
            status: partner.status,
            discount: partner.guestDiscountSlab || config?.baseGuestDiscount || 7.5
        });
    } catch (error) {
        console.error("Partner Details API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
