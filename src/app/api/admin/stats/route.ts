import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const prisma = getPrisma();

        const partners = await prisma.partner.findMany();
        const guests = await prisma.guest.findMany();
        const scanLogs = await prisma.scanLog.findMany();

        // 1. Active Partners (Only those with status ACTIVE)
        const activePartners = partners.filter((p: any) => p.status === "ACTIVE").length;

        // 2. Pending Approvals
        const pendingApprovals = partners.filter((p: any) => p.status === "PENDING").length;

        // 3. Sales Total & Converted (Total sales from all settled/paid scans)
        const settledScans = scanLogs.filter((log: any) => log.status === "SETTLED" || log.status === "PAID");
        const salesTotal = settledScans.reduce((acc: number, log: any) => acc + (log.billAmount || 0), 0);
        const salesConverted = settledScans.length;

        // 4. Total Leads (Total Guest records) - This represents the referral pipeline
        const totalLeads = guests.length;

        // 5. Avg Commission
        const avgCommission = partners.length > 0
            ? partners.reduce((acc: number, p: any) => acc + (p.commissionSlab || 0), 0) / partners.length
            : 0;

        // 6. Total Owed (Sum of commissions earned by partners that are NOT PAID yet)
        const totalOwedAmount = scanLogs
            .filter((log: any) => log.status === "SETTLED")
            .reduce((acc: number, log: any) => acc + (log.partnerCommissionAmount || log.discountAmount || 0), 0);

        // 7. Recent Approvals (Partners requiring ACTION - PENDING ones)
        const recentApprovals = partners
            .filter((p: any) => p.status === "PENDING")
            .sort((a: any, b: any) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime())
            .slice(0, 5)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                category: "Hospitality",
                date: new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }));

        // 8. Performance Momentum (Last 7 Days)
        const weeklyPerformance = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            const dayStart = new Date(d.setHours(0, 0, 0, 0));
            const dayEnd = new Date(d.setHours(23, 59, 59, 999));

            const dayReferrals = guests.filter(g => {
                const created = new Date(g.createdAt);
                return created >= dayStart && created <= dayEnd;
            }).length;

            const dayRevenue = scanLogs.filter(l => {
                const created = new Date(l.createdAt);
                return created >= dayStart && created <= dayEnd;
            }).reduce((acc, l) => acc + (l.billAmount || 0), 0);

            weeklyPerformance.push({
                name: dateStr,
                referrals: dayReferrals,
                revenue: dayRevenue
            });
        }

        return NextResponse.json({
            success: true,
            stats: {
                totalPartners: activePartners.toLocaleString(),
                pendingApprovals: pendingApprovals.toString(),
                totalLeads: totalLeads.toLocaleString(),
                salesConverted: salesConverted.toLocaleString(),
                salesTotal: salesTotal < 1000 ? `₹${salesTotal}` : `₹${(salesTotal / 1000).toFixed(1)}K`,
                monthlyRevenue: `₹${(salesTotal / 1000).toFixed(1)}K`, 
                actualRevenue: salesTotal,
                avgCommission: `${avgCommission.toFixed(1)}%`,
                totalOwed: `₹${(totalOwedAmount / 1000).toFixed(2)}K`
            },
            recentApprovals,
            weeklyPerformance
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
    }
}
