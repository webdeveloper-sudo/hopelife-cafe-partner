import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { partnerName, contactName, mobile, email, businessType, address, city, pincode, commissionSlab, upiId, referredBy } = body;

        // Mobile is strictly required
        const cleanMobile = mobile ? mobile.replace(/\D/g, "").slice(-10) : "";
        if (!cleanMobile || cleanMobile.length !== 10) {
            return NextResponse.json({ error: "A valid 10-digit mobile number is required" }, { status: 400 });
        }

        // Email is optional, but if provided must be valid format
        const cleanEmail = email && typeof email === "string" && email.trim() ? email.toLowerCase().trim() : null;
        if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return NextResponse.json({ error: "Please enter a valid email address or leave it blank" }, { status: 400 });
        }

        if (!partnerName || !contactName || !upiId) {
            return NextResponse.json({ error: "Missing required fields (including Business Name, Contact Person, and Settlement UPI ID)" }, { status: 400 });
        }

        const cleanUpi = upiId.trim();
        if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(cleanUpi)) {
            return NextResponse.json({ error: "Valid UPI ID is required for settlements (e.g. name@bank)" }, { status: 400 });
        }

        const prisma = getPrisma();

        // Fetch system config
        const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
        const baseCommission = config?.baseCommission ?? 7.5;
        const baseGuestDiscount = config?.baseGuestDiscount ?? 7.5;

        // Determine effective commission slab
        const effectiveCommission = commissionSlab ? parseFloat(commissionSlab) : baseCommission;
        const effectiveDiscount   = commissionSlab ? parseFloat(commissionSlab) : baseGuestDiscount;

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
            if (existingMobile.password) {
                return NextResponse.json({ error: "A partner with this mobile number already exists." }, { status: 409 });
            }
            return NextResponse.json({
                success: true,
                alreadyInitiated: true,
                partnerCode: existingMobile.partnerCode,
                mobile: cleanMobile,
                redirectUrl: `/verify-partner?mobile=${cleanMobile}`
            });
        }

        // Check duplicate email only if provided
        if (cleanEmail) {
            const existingEmail = await prisma.partner.findFirst({ where: { email: cleanEmail } });
            if (existingEmail) {
                return NextResponse.json({ error: "A partner with this email already exists." }, { status: 409 });
            }
        }

        // Generate partner code
        const slug = partnerName.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(" ").map((w: string) => w.slice(0, 3)).join("").slice(0, 8);
        const partnerCode = `${slug}${Date.now().toString().slice(-4)}`;

        const partner = await prisma.partner.create({
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
                commissionSlab: effectiveCommission,
                guestDiscountSlab: effectiveDiscount,
                status: "PENDING",
                walletBalance: 0,
                bonusCommission: 0,
                retentionStreak: 0,
                referredBy: referredBy || "volunteer",
            }
        });

        return NextResponse.json({
            success: true,
            partnerCode: partner.partnerCode,
            mobile: partner.mobile,
            redirectUrl: `/verify-partner?mobile=${partner.mobile}`
        });
    } catch (err: any) {
        console.error("Admin onboard partner error:", err);
        return NextResponse.json({ error: "Failed to onboard partner." }, { status: 500 });
    }
}
