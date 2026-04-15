import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = 'nodejs';

// Marketing exec registers a new partner
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { partnerName, contactName, mobile, email, password, commissionSlab, businessType } = body;

        if (!partnerName || !contactName || !mobile || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Generate a unique partner code from partner name
        const slug = partnerName
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, "")
            .split(" ")
            .map((w: string) => w.slice(0, 3))
            .join("")
            .slice(0, 8);
        const partnerCode = `${slug}${Date.now().toString().slice(-4)}`;

        // Check for duplicate mobile
        const existing = await prisma.partner.findUnique({ where: { mobile } });
        if (existing) {
            return NextResponse.json({ error: "A partner with this mobile already exists." }, { status: 409 });
        }

        const newPartner = await prisma.partner.create({
            data: {
                id: `p_${Date.now()}`,
                name: partnerName,
                contactName,
                mobile,
                email: email || null,
                password: crypto.createHash("sha256").update(password).digest("hex"),
                partnerCode,
                businessType: businessType || null,
                commissionSlab: parseFloat(commissionSlab) || 7.5,
                guestDiscountSlab: parseFloat(commissionSlab) || 7.5, // Default to matching commission
                status: "PENDING",
                walletBalance: 500, // ₹500 joining bonus
                joinedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            partnerCode: newPartner.partnerCode,
            passUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/p/${newPartner.partnerCode}`
        });

    } catch (err) {
        console.error("Partner register error:", err);
        return NextResponse.json({ error: "Failed to register partner." }, { status: 500 });
    }
}
