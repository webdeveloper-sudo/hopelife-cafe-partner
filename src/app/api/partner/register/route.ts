import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendAdminNewPartnerAlert, sendPartnerApprovalEmail } from "@/lib/email";
import { getSession } from "@/lib/auth";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            verificationToken,
            partnerName, contactName, mobile, email,
            businessType, address, city, pincode, commissionSlab, upiId,
            registeredByMarketingRepId: bodyRepId
        } = body;
        
        const session = await getSession();
        const isMarketingRep = session?.role === "MARKETING";
        const registeredByMarketingRepId = isMarketingRep ? session.id : bodyRepId;

        // If marketing rep, we might skip token requirement or require it depending on the flow.
        // For standard public registration, verificationToken is mandatory.
        if (!partnerName || !contactName || !mobile || !email || !upiId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        if (!isMarketingRep && !verificationToken) {
            return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
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
        
        let validRepId = null;
        let finalStatus = "ACTIVE"; // Auto-approve all partners now

        if (registeredByMarketingRepId) {
            const repExists = await prisma.marketingRep.findUnique({ where: { id: registeredByMarketingRepId } });
            if (repExists) {
                validRepId = registeredByMarketingRepId;
            }
        }

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
                upiId: upiId,
                commissionSlab: parseFloat(commissionSlab) || baseComm,
                guestDiscountSlab: parseFloat(commissionSlab) || baseDisc,
                status: finalStatus,
                walletBalance: 0,
                ...(validRepId ? { registeredByMarketingRepId: validRepId } : {})
            }
        });

        // Notify admin
        await sendAdminNewPartnerAlert(partnerName, contactName, email, mobile, businessType || "N/A");

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hopelife-cafe-partner.vercel.app";

        // Generate the token and send the setup email for BOTH marketing and volunteer registrations
        const token = jwt.sign(
            { partnerId: newPartner.id, email: newPartner.email, purpose: "set-password" },
            process.env.JWT_SECRET || "hope-cafe-secret",
            { expiresIn: "48h" }
        );
        const setPasswordUrl = `${appUrl}/set-password?token=${token}&email=${encodeURIComponent(newPartner.email || "")}`;
        
        const emailSent = await sendPartnerApprovalEmail(
            newPartner.email,
            newPartner.name,
            newPartner.contactName || newPartner.name,
            setPasswordUrl
        );

        if (!emailSent) {
            // Rollback if email failed, allowing them to try again
            await prisma.partner.delete({ where: { id: newPartner.id } });
            return NextResponse.json({ error: "Failed to send the invitation email. The registration has been reverted. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            partnerCode: newPartner.partnerCode,
            passUrl: `${appUrl}/p/${newPartner.id}`,
            emailSent
        });
    } catch (err) {
        console.error("Partner register error:", err);
        return NextResponse.json({ error: "Failed to register partner." }, { status: 500 });
    }
}
