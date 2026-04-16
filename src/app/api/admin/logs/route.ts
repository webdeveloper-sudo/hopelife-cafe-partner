import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const prisma = getPrisma();

        // Fetch data to construct logs
        const scanLogs = await prisma.scanLog.findMany({ include: { guest: true } });
        const partners = await prisma.partner.findMany();
        const payouts = await prisma.payout.findMany();

        const logs: any[] = [];

        // 1. Transaction Logs
        scanLogs.forEach((log: any) => {
            logs.push({
                id: `log-${log.id}`,
                type: "TRANSACTION",
                title: "Transaction Settled",
                description: `₹${log.billAmount} settled for guest ${log.guest?.name || 'Unknown'} via ${log.guest?.partner?.name || 'Partner'}.`,
                timestamp: new Date(log.createdAt).getTime(),
                status: log.status
            });
        });

        // 2. Partner Onboarding
        partners.forEach((partner: any) => {
            logs.push({
                id: `partner-${partner.id}`,
                type: "PARTNER",
                title: "Partner Registered",
                description: `${partner.name} joined as a new referral partner.`,
                timestamp: new Date(partner.createdAt).getTime(),
                status: partner.status
            });
        });

        // 3. Payout Events
        payouts.forEach((payout: any) => {
            logs.push({
                id: `payout-${payout.id}`,
                type: "PAYOUT",
                title: "Batch Settlement Triggered",
                description: `Batch payment of ₹${payout.amount} processed for partner ID ${payout.partnerId}.`,
                timestamp: new Date(payout.createdAt).getTime(),
                status: "COMPLETED"
            });
        });

        // Sort by newest first
        const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

        return NextResponse.json({
            success: true,
            logs: sortedLogs
        });

    } catch (error) {
        console.error("Failed to fetch system logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
