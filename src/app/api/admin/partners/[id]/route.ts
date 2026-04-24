import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const prisma = getPrisma();

    const partner = await prisma.partner.findUnique({
      where: { id },
      select: {
        id: true,
        partnerCode: true,
        name: true,
        upiId: true,
        walletBalance: true,
        status: true,
        mobile: true,
        email: true
      }
    });

    if (!partner) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        partner
    });
  } catch (err) {
    console.error("Single partner fetch error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
