import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendPartnerApprovalEmail } from "@/lib/email";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { partnerName, contactName, mobile, email, businessType, address, city, pincode, commissionSlab } = body;

        if (!partnerName || !contactName || !mobile || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Check duplicates
        const existingMobile = await prisma.partner.findUnique({ where: { mobile } });
        if (existingMobile) {
            return NextResponse.json({ error: "A partner with this mobile already exists." }, { status: 409 });
        }
        const existingEmail = await prisma.partner.findFirst({ where: { email: email.toLowerCase() } });
        if (existingEmail) {
            return NextResponse.json({ error: "A partner with this email already exists." }, { status: 409 });
        }

        // Generate partner code
        const slug = partnerName.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(" ").map((w: string) => w.slice(0, 3)).join("").slice(0, 8);
        const partnerCode = `${slug}${Date.now().toString().slice(-4)}`;

        const partner = await prisma.partner.create({
            data: {
                name: partnerName,
                contactName,
                mobile,
                email: email.toLowerCase(),
                partnerCode,
                businessType: businessType || null,
                address: address || null,
                city: city || null,
                pincode: pincode || null,
                commissionSlab: parseFloat(commissionSlab) || 7.5,
                guestDiscountSlab: parseFloat(commissionSlab) || 7.5,
                status: "ACTIVE",
                walletBalance: 500,
            }
        });

        // Generate set-password token
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        const token = jwt.sign(
            { partnerId: partner.id, email: partner.email, purpose: "set-password" },
            jwtSecret,
            { expiresIn: "48h" }
        );

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";
        const setPasswordUrl = `${appUrl}/set-password?token=${token}&email=${encodeURIComponent(email)}`;

        // Send welcome email immediately
        await sendPartnerApprovalEmail(email, partnerName, contactName, setPasswordUrl);

        return NextResponse.json({ success: true, partnerCode: partner.partnerCode, setPasswordUrl });
    } catch (err) {
        console.error("Admin onboard partner error:", err);
        return NextResponse.json({ error: "Failed to onboard partner." }, { status: 500 });
    }
}
