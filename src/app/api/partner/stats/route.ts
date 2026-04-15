export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const prisma = getPrisma();

        // M1 FIX: Derive partnerId from the authenticated session, NOT query params.
        // This prevents a partner from querying another partner's stats.
        const session = await getSession();
        const partnerCodeFromSession = session?.partnerCode as string | undefined;

        // Allow admin override via query param only for admin tokens
        const { searchParams } = new URL(req.url);
        const queryPartnerId = searchParams.get('partnerId');
        const partnerId = (session?.role === "ADMIN" && queryPartnerId)
            ? queryPartnerId
            : (partnerCodeFromSession || 'demo');

        let partner = await prisma.partner.findUnique({
            where: { partnerCode: partnerId }
        });

        // Auto-seed for demo purposes if it doesn't exist yet
        if (!partner && partnerId === 'demo') {
            partner = await prisma.partner.create({
                data: {
                    partnerCode: "demo",
                    name: "Grand Hope Cafe (Demo)",
                    email: "demo@partner.hub",
                    mobile: "0000000000",
                    commissionSlab: 7.5
                }
            });
        }

        if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

        // Total Guests Registered (Leads)
        const totalLeads = await prisma.guest.count({
            where: { partnerId: partner.id }
        });

        // Get all applicable scans for this partner (SETTLED or PAID)
        const allScanLogs = await prisma.scanLog.findMany({
            where: { status: { in: ["SETTLED", "PAID"] } as any },
            include: { guest: true }
        });

        // Filter by partner in memory (mock DB legacy)
        const scanLogs = allScanLogs
            .filter((log: any) => log.guest?.partnerId === partner.id)
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        let totalCommission = 0;
        let totalSales = 0;
        let totalPaid = 0;

        const recentReferrals = scanLogs.slice(0, 50).map((log: any) => {
            // Use decoupled partnerCommissionAmount if available
            const comm = log.partnerCommissionAmount ?? (log.billAmount * (partner.commissionSlab / 100));

            totalCommission += comm;
            totalSales += log.billAmount;
            if (log.status === "PAID") totalPaid += comm;

            return {
                id: log.id,
                date: new Date(log.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                name: log.guest?.name ?? 'Unknown',
                bill: log.billAmount,
                commission: comm,
                status: log.status
            };
        });

        // Get Payout History
        const payouts = await prisma.payout.findMany({
            where: { partnerId: partner.id }
        });

        return NextResponse.json({
            success: true,
            metrics: {
                totalLeads,
                totalCommission,
                totalSales,
                totalPaid,
                totalOwed: totalCommission - totalPaid
            },
            recentReferrals,
            payouts: payouts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
            partnerDetails: {
                name: partner.name,
                code: partner.partnerCode,
                slab: partner.commissionSlab,
                currentTier: partner.currentTier || "BRONZE",
                businessType: partner.businessType || "N/A",
                referralGoal: partner.referralGoal || 10,
                totalLeads: totalLeads
            }
        });

    } catch (error) {
        console.error("Partner Stats Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
