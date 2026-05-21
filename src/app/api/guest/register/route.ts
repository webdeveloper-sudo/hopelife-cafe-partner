import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";

const GuestRegistrationSchema = z.object({
    name: z.string().min(2, "Name is required"),
    mobile: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^\d+$/, "Contains invalid characters"),
    partnerId: z.string().min(1, "Partner ID is required"),
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validationResult = GuestRegistrationSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: validationResult.error.issues[0].message
            }, { status: 400 });
        }

        const { name, mobile, partnerId } = validationResult.data;

        const prisma = getPrisma();

        // Demo fallback: Ensure a demo partner exists
        let partnerDbId = partnerId;
        if (partnerId === "demo") {
            let demoPartner = await prisma.partner.findUnique({ where: { partnerCode: "demo" } });
            if (!demoPartner) {
                const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
                demoPartner = await prisma.partner.create({
                    data: {
                        partnerCode: "demo",
                        name: "Grand Hope Cafe (Demo)",
                        mobile: "0000000000",
                        commissionSlab: config?.baseCommission || 7.5,
                        guestDiscountSlab: config?.baseGuestDiscount || 7.5
                    }
                });
            }
            partnerDbId = demoPartner.id;
        } else {
            // Find actual partner (assuming partnerId in URL is the partnerCode)
            const partner = await prisma.partner.findUnique({
                where: { partnerCode: partnerId }
            });

            if (!partner) {
                return NextResponse.json({ error: "Invalid Partner Code" }, { status: 404 });
            }
            partnerDbId = partner.id;
        }

        // 1. Find or create the Guest (include dynamicQr to check daily pass limits)
        let guest = await prisma.guest.findUnique({
            where: { mobileNumber: mobile },
            include: { dynamicQr: true }
        });

        // Enforce 1 pass per mobile number per calendar day (resets at 12:00 AM local server time)
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        if (guest && guest.dynamicQr) {
            const passCreated = new Date(guest.dynamicQr.createdAt);
            if (passCreated >= startOfToday && passCreated <= endOfToday) {
                return NextResponse.json({
                    error: "A pass has already been generated for this mobile number today. Please wait until 12 AM tomorrow to generate a new pass."
                }, { status: 400 });
            }
        }

        if (!guest) {
            guest = await prisma.guest.create({
                data: {
                    name,
                    mobileNumber: mobile,
                    partnerId: partnerDbId,
                    isRedeemed: false
                },
                include: { dynamicQr: true }
            });
        } else {
            // Reset isRedeemed status to false for the new daily pass, and update name if it changed
            guest = await prisma.guest.update({
                where: { id: guest.id },
                data: {
                    name,
                    isRedeemed: false
                },
                include: { dynamicQr: true }
            });
        }

        // 2. Generate/Update Dynamic QR Secret
        const secretKey = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // Pass valid for 24 hours

        // Get referral frequency (total settled visits)
        const referralCount = await prisma.scanLog.count({
            where: { guestId: guest.id }
        });

        await prisma.dynamicQR.upsert({
            where: { guestId: guest.id },
            create: {
                guestId: guest.id,
                secretKey,
                expiresAt,
                createdAt: new Date() // Record creation timestamp
            },
            update: {
                secretKey,
                expiresAt,
                createdAt: new Date() // Record refresh/update timestamp for daily resets
            }
        });

        // 3. Trigger WhatsApp Delivery API (Internal Call or Service)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hopelife-cafe-partner.vercel.app';
        const passLink = `${baseUrl}/pass/${guest.id}`;

        // Simulating the WhatsApp Send API call
        console.log(`[🌴 WHATSAPP TROPICAL MOCK] Sending 'Aloha' Guest Pass to +91${mobile}: ${passLink}`);

        // Optionally, call our local mocked route if we want to trace it independently
        // fetch(`${baseUrl}/api/whatsapp/send`, { ... })

        return NextResponse.json({
            success: true,
            message: "Aloha! Your HOPE Cafe Guest Pass has been generated and delivered via WhatsApp. 🌴🌺",
            guestId: guest.id,
            referralCount: referralCount + 1 // This is their Nth referral
        });

    } catch (error) {
        console.error("Guest Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
