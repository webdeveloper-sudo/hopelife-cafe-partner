import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const prisma = getPrisma();
        const partners = await prisma.partner.findMany();
        return NextResponse.json(partners);
    } catch (err) {
        console.error("Fetch partners error:", err);
        return NextResponse.json({ error: "Failed to fetch partners." }, { status: 500 });
    }
}
