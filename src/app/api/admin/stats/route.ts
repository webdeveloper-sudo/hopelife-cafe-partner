import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const prisma = getPrisma();

        const partners = await prisma.partner.findMany();
        const guests = await prisma.guest.findMany();
        const scanLogs = await prisma.scanLog.findMany();

        // 1. Total Partners
        const totalPartners = partners.length;

        // 2. Pending Approvals
        const pendingApprovals = partners.filter((p: any) => p.status === "PENDING").length;

        // 3. Monthly Revenue (Total sales from all settled/paid scans)
        const totalRevenue = scanLogs
            .filter((log: any) => log.status === "SETTLED" || log.status === "PAID")
            .reduce((acc: number, log: any) => acc + (log.billAmount || 0), 0);

        // 4. Avg Commission
        const avgCommission = partners.length > 0
            ? partners.reduce((acc: number, p: any) => acc + (p.commissionSlab || 0), 0) / partners.length
            : 0;

        // 5. Total Owed (Sum of commissions earned by partners that are NOT PAID yet)
        const totalOwedAmount = scanLogs
            .filter((log: any) => log.status === "SETTLED")
            .reduce((acc: number, log: any) => acc + (log.partnerCommissionAmount || log.discountAmount || 0), 0);

        // 6. Recent Approvals (Partners requiring ACTION - PENDING ones)
        const recentApprovals = partners
            .filter((p: any) => p.status === "PENDING")
            .sort((a: any, b: any) => new Date(b.joinedAt || Date.now()).getTime() - new Date(a.joinedAt || Date.now()).getTime())
            .slice(0, 5)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                category: "Hospitality",
                date: new Date(p.joinedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }));

        return NextResponse.json({
            success: true,
            stats: {
                totalPartners: totalPartners.toLocaleString(),
                pendingApprovals: pendingApprovals.toString(),
                monthlyRevenue: `₹${(totalRevenue / 1000000).toFixed(1)}M`, // Display in Millions
                actualRevenue: totalRevenue,
                avgCommission: `${avgCommission.toFixed(1)}%`,
                totalOwed: `₹${(totalOwedAmount / 100000).toFixed(2)}L` // Display in Lakhs
            },
            recentApprovals
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
    }
}
