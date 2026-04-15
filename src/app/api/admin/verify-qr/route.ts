import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import crypto from "crypto";
import { z } from "zod";

const VerifyQRSchema = z.object({
    qrData: z.string().min(1, "Missing QR Data"),
    action: z.enum(["verify", "settle"]),
    billAmount: z.number().optional(),
    adminId: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // RBAC Enforcement
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Admin personnel only." }, { status: 403 });
        }

        const prisma = getPrisma();

        const validationResult = VerifyQRSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: validationResult.error.issues[0].message
            }, { status: 400 });
        }

        const { qrData, action, billAmount, adminId } = validationResult.data;

        // Phase 1: Verify the QR payload
        let parsedQr: any;
        try {
            parsedQr = JSON.parse(qrData);
            console.log("DEBUG: Parsed QR Data Success", parsedQr);
        } catch (e: any) {
            console.error("DEBUG: JSON Parse Error on qrData", qrData);
            return NextResponse.json({ error: "Invalid QR Format", details: e.message }, { status: 400 });
        }

        const { data: parsedData, signature } = parsedQr;

        if (!parsedData || !signature) {
            return NextResponse.json({ error: "Missing Secure Signature" }, { status: 400 });
        }

        const { guestId, timestamp } = parsedData;

        // TOTP Time Window Validation
        const now = Date.now();
        const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes expiry for security
        if (now - timestamp > MAX_AGE_MS) {
            return NextResponse.json({ error: "QR Code Expired. Please refresh." }, { status: 400 });
        }

        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            include: { partner: true, dynamicQr: true }
        });

        if (!guest || !guest.dynamicQr) return NextResponse.json({ error: "Guest or QR Record not found" }, { status: 404 });

        // Phase 1.5: Cryptographically verify the HMAC signature
        // Using deterministic key-sorted stringification to avoid signature mismatches
        const sortedData = Object.keys(parsedData).sort().reduce((obj: any, key) => {
            obj[key] = parsedData[key];
            return obj;
        }, {});

        const expectedSignature = crypto
            .createHmac('sha256', guest.dynamicQr.secretKey)
            .update(JSON.stringify(sortedData))
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid Digital Signature. Pass may be spoofed." }, { status: 403 });
        }

            // Phase 2: If action is "settle", process the billing
        if (action === "settle") {
            if (!billAmount) return NextResponse.json({ error: "Missing Bill Amount" }, { status: 400 });

            // ENFORCE OPTION A: STRICT ONE-TIME USE
            // Ensure no duplicate settlements EVER for this guest
            const existingScan = await prisma.scanLog.findFirst({
                where: {
                    guestId: guest.id,
                }
            });

            if (existingScan) {
                return NextResponse.json({ error: "Pass ALREADY REDEEMED. This is a one-time discount only." }, { status: 400 });
            }

            const guestDiscountSlab = guest.partner.guestDiscountSlab || guest.partner.commissionSlab || 7.5;
            const partnerCommissionSlab = guest.partner.commissionSlab || 7.5;

            const guestDiscountAmount = billAmount * (guestDiscountSlab / 100);
            const partnerCommissionAmount = billAmount * (partnerCommissionSlab / 100);

            const scanLog = await prisma.scanLog.create({
                data: {
                    guestId: guest.id,
                    adminId: adminId || "SYSTEM",
                    billAmount,
                    discountAmount: guestDiscountAmount, // For backward compatibility in some views
                    guestDiscountAmount,
                    partnerCommissionAmount,
                    status: "SETTLED"
                }
            });

            return NextResponse.json({
                success: true,
                message: "Transaction Completed",
                scanLogId: scanLog.id,
                discountApplied: guestDiscountAmount,
                commissionEarned: partnerCommissionAmount
            });
        }

        // Just returning verification data
        const redemptionCheck = await prisma.scanLog.findFirst({
            where: { guestId: guest.id }
        });

        return NextResponse.json({
            success: true,
            guest: {
                id: guest.id,
                name: guest.name,
                mobile: guest.mobileNumber,
                partnerName: guest.partner.name,
                commissionSlab: guest.partner.commissionSlab,
                guestDiscountSlab: guest.partner.guestDiscountSlab || guest.partner.commissionSlab,
                isRedeemed: !!redemptionCheck
            }
        });

    } catch (error: any) {
        console.error("QR Verification Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
