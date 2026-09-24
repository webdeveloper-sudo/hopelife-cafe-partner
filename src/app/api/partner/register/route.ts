import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendAdminNewPartnerAlert } from "@/lib/email";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            partnerName, contactName, mobile, email,
            businessType, address, city, pincode, commissionSlab, upiId,
            registeredByMarketingRepId: bodyRepId,
            referredBy
        } = body;
        
        const session = await getSession();
        const isMarketingRep = session?.role === "MARKETING";
        const registeredByMarketingRepId = isMarketingRep ? session.id : bodyRepId;

        // Mobile is strictly required
        const cleanMobile = mobile ? mobile.replace(/\D/g, "").slice(-10) : "";
        if (!cleanMobile || cleanMobile.length !== 10) {
            return NextResponse.json({ error: "A valid 10-digit mobile number is required" }, { status: 400 });
        }

        // Email is optional, but if provided must be valid format
        const cleanEmail = email && typeof email === "string" && email.trim() ? email.toLowerCase().trim() : null;
        if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return NextResponse.json({ error: "Please provide a valid email address or leave it blank" }, { status: 400 });
        }

        if (!partnerName || !contactName || !businessType || !address || !city || !pincode || !upiId) {
            return NextResponse.json({ error: "Missing required fields (including Business Details and Settlement UPI ID)" }, { status: 400 });
        }

        const cleanUpi = upiId.trim();
        if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(cleanUpi)) {
            return NextResponse.json({ error: "Valid UPI ID is required for settlements (e.g. name@bank)" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Check duplicate mobile
        const existingMobile = await prisma.partner.findFirst({
            where: {
                OR: [
                    { mobile: cleanMobile },
                    { mobile: `+91${cleanMobile}` },
                    { mobile: `91${cleanMobile}` }
                ]
            }
        });

        if (existingMobile) {
            // If already fully registered and password set, disallow duplicate
            if (existingMobile.password) {
                return NextResponse.json({ 
                    error: "A partner with this mobile number already exists. Please log in.",
                    mobileExists: true 
                }, { status: 409 });
            }
            // If registered previously but didn't finish setting password, allow navigating to verification
            return NextResponse.json({
                success: true,
                alreadyInitiated: true,
                partnerCode: existingMobile.partnerCode,
                mobile: cleanMobile,
                redirectUrl: `/verify-partner?mobile=${cleanMobile}`
            });
        }

        // Check duplicate email if email provided
        if (cleanEmail) {
            const existingEmail = await prisma.partner.findFirst({ where: { email: cleanEmail } });
            if (existingEmail) {
                return NextResponse.json({ error: "A partner with this email already exists." }, { status: 409 });
            }
        }

        // Generate partner code
        const slug = partnerName.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(" ").map((w: string) => w.slice(0, 3)).join("").slice(0, 8);
        const partnerCode = `${slug}${Date.now().toString().slice(-4)}`;

        const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
        const baseComm = config?.baseCommission ?? 7.5;
        const baseDisc = config?.baseGuestDiscount ?? 7.5;
        
        let validRepId = null;
        if (registeredByMarketingRepId) {
            const rep = await prisma.marketingRep.findUnique({ where: { id: registeredByMarketingRepId } });
            if (rep) {
                if (rep.status !== "ACTIVE") {
                    return NextResponse.json({ error: "Your marketing account is deactivated. Cannot register partners." }, { status: 401 });
                }
                validRepId = registeredByMarketingRepId;
            }
        }

        const newPartner = await prisma.partner.create({
            data: {
                name: partnerName.trim(),
                contactName: contactName.trim(),
                mobile: cleanMobile,
                email: cleanEmail,
                partnerCode,
                businessType: businessType || null,
                address: address || null,
                city: city || null,
                pincode: pincode || null,
                upiId: cleanUpi,
                commissionSlab: parseFloat(commissionSlab) || baseComm,
                guestDiscountSlab: parseFloat(commissionSlab) || baseDisc,
                status: "PENDING", // Pending until WhatsApp OTP verified & password set
                walletBalance: 0,
                referredBy: referredBy || "volunteer",
                ...(validRepId ? { registeredByMarketingRepId: validRepId } : {})
            }
        });

        // Notify admin in background (non-blocking)
        try {
            sendAdminNewPartnerAlert(partnerName, contactName, cleanEmail || "Not provided", cleanMobile, businessType || "N/A");
        } catch (e) {
            console.error("Non-critical admin alert error:", e);
        }

        return NextResponse.json({ 
            success: true, 
            partnerCode: newPartner.partnerCode,
            mobile: newPartner.mobile,
            redirectUrl: `/verify-partner?mobile=${newPartner.mobile}`
        });
    } catch (err: any) {
        console.error("Partner register error:", err);
        return NextResponse.json({ error: "Failed to register partner." }, { status: 500 });
    }
}
