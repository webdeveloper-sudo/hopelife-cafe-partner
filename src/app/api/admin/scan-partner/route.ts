import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const ScanPartnerSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("verify"),
        partnerCode: z.string().min(1, "Missing partner code"),
    }),
    z.object({
        action: z.literal("register-guest"),
        partnerCode: z.string().min(1, "Missing partner code"),
        guestName: z.string().min(2, "Guest name is required"),
        guestMobile: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^\d+$/, "Contains invalid characters"),
    }),
    z.object({
        action: z.literal("settle"),
        guestId: z.string().min(1, "Guest ID is required"),
        billAmount: z.number().positive("Bill amount must be positive"),
    }),
]);

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // RBAC Enforcement
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin personnel only." }, { status: 403 });
        }

        const prisma = getPrisma();

        const validationResult = ScanPartnerSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: validationResult.error.issues[0].message
            }, { status: 400 });
        }

        const data = validationResult.data;

        // --- ACTION 1: VERIFY ---
        if (data.action === "verify") {
            let code = data.partnerCode.trim();
            
            // Extract code if it's a full URL (e.g. http://localhost:3000/p/PARTNER_CODE or /refer/PARTNER_CODE)
            if (code.includes("/p/")) {
                const parts = code.split("/p/");
                code = parts[parts.length - 1].split("?")[0].split("#")[0].split("/")[0];
            } else if (code.includes("/refer/")) {
                const parts = code.split("/refer/");
                code = parts[parts.length - 1].split("?")[0].split("#")[0].split("/")[0];
            }

            const partner = await prisma.partner.findUnique({
                where: { partnerCode: code },
            });

            if (!partner) {
                return NextResponse.json({ error: "Partner not found with code: " + code }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                partner: {
                    id: partner.id,
                    name: partner.name,
                    partnerCode: partner.partnerCode,
                    status: partner.status,
                    commissionSlab: partner.commissionSlab,
                    guestDiscountSlab: partner.guestDiscountSlab,
                    businessType: partner.businessType || "N/A",
                }
            });
        }

        // --- ACTION 2: REGISTER GUEST ---
        if (data.action === "register-guest") {
            const { partnerCode, guestName, guestMobile } = data;

            const partner = await prisma.partner.findUnique({
                where: { partnerCode },
            });

            if (!partner) {
                return NextResponse.json({ error: "Partner not found" }, { status: 404 });
            }

            // Validate that the partner is active, valid, and not restricted or blocked.
            if (partner.status !== "ACTIVE") {
                let errorMsg = "Partner is not active.";
                if (partner.status === "RESTRICTED") {
                    errorMsg = "Partner account is Restricted/Blocked. Cannot settle referral.";
                } else if (partner.status === "PENDING") {
                    errorMsg = "Partner account is pending approval.";
                } else if (partner.status === "REJECTED") {
                    errorMsg = "Partner account is rejected.";
                }
                return NextResponse.json({ error: errorMsg, isBlocked: true }, { status: 400 });
            }

            // Find or create Guest by mobile number
            let guest = await prisma.guest.findUnique({
                where: { mobileNumber: guestMobile },
            });

            if (!guest) {
                guest = await prisma.guest.create({
                    data: {
                        name: guestName,
                        mobileNumber: guestMobile,
                        partnerId: partner.id,
                        isRedeemed: false,
                    }
                });
            } else {
                // Reset isRedeemed status, update name & link to current partner
                guest = await prisma.guest.update({
                    where: { id: guest.id },
                    data: {
                        name: guestName,
                        partnerId: partner.id,
                        isRedeemed: false,
                    }
                });
            }

            const referralCount = await prisma.scanLog.count({
                where: { guestId: guest.id }
            });

            return NextResponse.json({
                success: true,
                guest: {
                    id: guest.id,
                    name: guest.name,
                    mobile: guest.mobileNumber,
                    partnerName: partner.name,
                    commissionSlab: partner.commissionSlab,
                    guestDiscountSlab: partner.guestDiscountSlab || partner.commissionSlab || 7.5,
                    referralCount: referralCount + 1, // Next visit number
                }
            });
        }

        // --- ACTION 3: SETTLE ---
        if (data.action === "settle") {
            const { guestId, billAmount } = data;

            const guest = await prisma.guest.findUnique({
                where: { id: guestId },
                include: { partner: true },
            });

            if (!guest) {
                return NextResponse.json({ error: "Guest not found" }, { status: 404 });
            }

            // Double check partner status at time of settlement
            if (guest.partner.status !== "ACTIVE") {
                return NextResponse.json({ error: "Partner account is restricted/blocked. Cannot settle transaction." }, { status: 400 });
            }

            const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
            const baseComm = config?.baseCommission ?? 7.5;
            const baseDisc = config?.baseGuestDiscount ?? 7.5;

            // Calculate effective slabs
            const partnerCommissionSlab = (guest.partner.commissionSlab || baseComm) + (guest.partner.bonusCommission || 0);
            const guestDiscountSlab = guest.partner.guestDiscountSlab || guest.partner.commissionSlab || baseDisc;

            const guestDiscountAmount = billAmount * (guestDiscountSlab / 100);
            const partnerCommissionAmount = billAmount * (partnerCommissionSlab / 100);

            const [scanLog] = await prisma.$transaction([
                prisma.scanLog.create({
                    data: {
                        guestId: guest.id,
                        adminId: session.id || "SYSTEM",
                        billAmount,
                        discountAmount: guestDiscountAmount,
                        guestDiscountAmount,
                        partnerCommissionAmount,
                        status: "SETTLED"
                    }
                }),
                prisma.partner.update({
                    where: { id: guest.partnerId },
                    data: {
                        walletBalance: { increment: partnerCommissionAmount },
                        earnedCommission: { increment: partnerCommissionAmount },
                        walletTotal: { increment: partnerCommissionAmount }
                    }
                }),
                prisma.guest.update({
                    where: { id: guest.id },
                    data: { isRedeemed: true }
                })
            ]);

            // Trigger Tier Upgrade Evaluation
            let tierResult: any = null;
            try {
                const { evaluateTierUpgrade } = await import("@/lib/tier");
                tierResult = await evaluateTierUpgrade(guest.partnerId);
            } catch (tierErr) {
                console.error("Tier upgrade evaluation failed:", tierErr);
            }

            // Fetch final balance
            const finalPartner = await prisma.partner.findUnique({ 
                where: { id: guest.partnerId },
                select: { walletBalance: true }
            });

            return NextResponse.json({
                success: true,
                message: "Transaction Completed",
                scanLogId: scanLog.id,
                discountApplied: guestDiscountAmount,
                commissionEarned: partnerCommissionAmount,
                newWalletBalance: finalPartner?.walletBalance || 0,
                tierUpgrade: tierResult?.upgraded ? {
                    newTier: tierResult.newTier,
                    bonusAwarded: tierResult.bonusAwarded
                } : null
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Partner QR Scanner API Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
