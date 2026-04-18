import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        console.log("[LOGS API] Session:", session);
        
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            console.warn("[LOGS API] Unauthorized access attempt", { session });
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const prisma = getPrisma();

        // Fetch data to construct logs
        const [scanLogs, partners, payouts] = await Promise.all([
            prisma.scanLog.findMany({ 
                include: { 
                    guest: {
                        include: { partner: true }
                    } 
                } 
            }),
            prisma.partner.findMany(),
            prisma.payout.findMany()
        ]);

        const logs: any[] = [];

        // 1. Transaction Logs
        scanLogs.forEach((log: any) => {
            try {
                logs.push({
                    id: `log-${log.id}`,
                    type: "TRANSACTION",
                    title: "Transaction Settled",
                    description: `₹${log.billAmount} settled for guest ${log.guest?.name || 'Unknown'} via ${log.guest?.partner?.name || 'Partner'}.`,
                    timestamp: new Date(log.createdAt).getTime(),
                    status: log.status
                });
            } catch (e) {
                console.error("Error processing scan log:", log.id, e);
            }
        });

        // 2. Partner Onboarding
        partners.forEach((partner: any) => {
            try {
                logs.push({
                    id: `partner-${partner.id}`,
                    type: "PARTNER",
                    title: "Partner Registered",
                    description: `${partner.name} joined as a new referral partner.`,
                    timestamp: new Date(partner.createdAt).getTime(),
                    status: partner.status
                });
            } catch (e) {
                console.error("Error processing partner log:", partner.id, e);
            }
        });

        // 3. Payout Events
        payouts.forEach((payout: any) => {
            try {
                logs.push({
                    id: `payout-${payout.id}`,
                    type: "PAYOUT",
                    title: "Batch Settlement Triggered",
                    description: `Batch payment of ₹${payout.amount} processed for partner ID ${payout.partnerId}.`,
                    timestamp: new Date(payout.createdAt).getTime(),
                    status: "COMPLETED"
                });
            } catch (e) {
                console.error("Error processing payout log:", payout.id, e);
            }
        });

        // Sort by newest first
        const sortedLogs = logs
            .filter(l => l.timestamp)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 100);

        return NextResponse.json({
            success: true,
            logs: sortedLogs
        });

    } catch (error: any) {
        console.error("Failed to fetch system logs:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined 
        }, { status: 500 });
    }
}
