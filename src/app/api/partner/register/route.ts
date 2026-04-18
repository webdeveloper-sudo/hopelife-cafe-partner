import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendAdminNewPartnerAlert } from "@/lib/email";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            verificationToken,
            partnerName, contactName, mobile, email,
            businessType, address, city, pincode, commissionSlab
        } = body;

        if (!partnerName || !contactName || !mobile || !email || !verificationToken) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate the OTP verification token
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        let decoded: any;
        try {
            decoded = jwt.verify(verificationToken, jwtSecret);
        } catch {
            return NextResponse.json({ error: "Verification token expired. Please verify your email again." }, { status: 401 });
        }

        if (decoded.email !== email.toLowerCase() || !decoded.verified || decoded.purpose !== "partner-registration") {
            return NextResponse.json({ error: "Invalid verification token." }, { status: 401 });
        }

        const prisma = getPrisma();

        // Check duplicate mobile
        const existingMobile = await prisma.partner.findUnique({ where: { mobile } });
        if (existingMobile) {
            return NextResponse.json({ error: "A partner with this mobile number already exists." }, { status: 409 });
        }
        // Check duplicate email
        const existingEmail = await prisma.partner.findFirst({ where: { email: email.toLowerCase() } });
        if (existingEmail) {
            return NextResponse.json({ error: "A partner with this email already exists." }, { status: 409 });
        }

        // Generate partner code
        const slug = partnerName.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(" ").map((w: string) => w.slice(0, 3)).join("").slice(0, 8);
        const partnerCode = `${slug}${Date.now().toString().slice(-4)}`;

        const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
        const baseComm = config?.baseCommission ?? 7.5;
        const baseDisc = config?.baseGuestDiscount ?? 7.5;

        const newPartner = await prisma.partner.create({
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
                commissionSlab: parseFloat(commissionSlab) || baseComm,
                guestDiscountSlab: parseFloat(commissionSlab) || baseDisc,
                status: "PENDING",
                walletBalance: 0,
            }
        });

        // Notify admin
        await sendAdminNewPartnerAlert(partnerName, contactName, email, mobile, businessType || "N/A");

        return NextResponse.json({ success: true, partnerCode: newPartner.partnerCode });
    } catch (err) {
        console.error("Partner register error:", err);
        return NextResponse.json({ error: "Failed to register partner." }, { status: 500 });
    }
}
