import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendPartnerApprovalEmail } from "@/lib/email";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const prisma = getPrisma();

        const partner = await prisma.partner.findUnique({ where: { id } });
        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }
        if (partner.status === "ACTIVE") {
            return NextResponse.json({ error: "Partner is already approved" }, { status: 400 });
        }

        // Fetch system config to apply dynamic bonuses respecting maintenance mode
        const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
        const maintenanceMode = config?.maintenanceMode ?? false;
        const welcomeBonus = config?.welcomeBonus ?? 500;

        // Apply welcome bonus only if maintenance mode is OFF and partner has no balance yet
        const walletIncrement = (!maintenanceMode && partner.walletBalance === 0) ? welcomeBonus : 0;

        // Approve the partner and credit bonus to multi-attribute wallet
        const updated = await prisma.partner.update({
            where: { id },
            data: {
                status: "ACTIVE",
                ...(walletIncrement > 0 ? { 
                    walletBalance: { increment: walletIncrement },
                    bonusAmount: { increment: walletIncrement },
                    walletTotal: { increment: walletIncrement },
                    incomeLogs: {
                        create: {
                            amount: walletIncrement,
                            type: "WELCOME_BONUS",
                            description: "Seed credit for joining the HOPE Partnership Program"
                        }
                    }
                } : {})
            }
        });

        // Generate set-password token (48 hours)
        const jwtSecret = process.env.JWT_SECRET || "hope-cafe-secret";
        const token = jwt.sign(
            { partnerId: id, email: partner.email, purpose: "set-password" },
            jwtSecret,
            { expiresIn: "48h" }
        );

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";
        const setPasswordUrl = `${appUrl}/set-password?token=${token}&email=${encodeURIComponent(partner.email || "")}`;

        // Send welcome email
        if (partner.email) {
            await sendPartnerApprovalEmail(
                partner.email,
                partner.name,
                partner.contactName || partner.name,
                setPasswordUrl
            );
        }

        return NextResponse.json({
            success: true,
            partner: updated,
            setPasswordUrl,
            bonusApplied: walletIncrement > 0 ? walletIncrement : null
        });
    } catch (err) {
        console.error("Approve partner error:", err);
        return NextResponse.json({ error: "Failed to approve partner." }, { status: 500 });
    }
}
