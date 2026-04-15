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
                demoPartner = await prisma.partner.create({
                    data: {
                        partnerCode: "demo",
                        name: "Grand Hope Cafe (Demo)",
                        mobile: "0000000000",
                        commissionSlab: 7.5
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

        // 1. Find or create the Guest
        let guest = await prisma.guest.findUnique({
            where: { mobileNumber: mobile } // Assuming 1 guest per mobile for simplicity
        });

        if (!guest) {
            guest = await prisma.guest.create({
                data: {
                    name,
                    mobileNumber: mobile,
                    partnerId: partnerDbId
                }
            });
        } else {
            // Optional: update name and partner if they changed? Not doing for now to keep history intact.
        }

        // 2. Generate/Update Dynamic QR Secret
        const secretKey = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // Expires in 7 days for example

        await prisma.dynamicQR.upsert({
            where: { guestId: guest.id },
            create: {
                guestId: guest.id,
                secretKey,
                expiresAt
            },
            update: {
                secretKey,
                expiresAt
            }
        });

        // 3. Trigger WhatsApp Delivery API (Internal Call or Service)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
        const passLink = `${baseUrl}/pass/${guest.id}`;

        // Simulating the WhatsApp Send API call
        console.log(`[🌴 WHATSAPP TROPICAL MOCK] Sending 'Aloha' Guest Pass to +91${mobile}: ${passLink}`);

        // Optionally, call our local mocked route if we want to trace it independently
        // fetch(`${baseUrl}/api/whatsapp/send`, { ... })

        return NextResponse.json({
            success: true,
            message: "Aloha! Your HOPE Cafe Guest Pass has been generated and delivered via WhatsApp. 🌴🌺",
            guestId: guest.id // Included for frontend testing/redirect if needed
        });

    } catch (error) {
        console.error("Guest Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
