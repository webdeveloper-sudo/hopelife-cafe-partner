import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const prisma = getPrisma();

        const partners = await prisma.partner.findMany();
        const scanLogs = await prisma.scanLog.findMany({
            where: { status: { in: ["SETTLED", "PAID"] } as any }
        });

        // 1. Total Partners Onboarded (For demo, all partners)
        const totalPartners = partners.length;

        // 2. Active this week (Joined in last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();
        const activeThisWeek = partners.filter((p: any) => new Date(p.createdAt).getTime() >= sevenDaysAgo).length;

        // 3. Network Sales Generated
        const totalSales = scanLogs.reduce((acc: number, log: any) => acc + (log.billAmount || 0), 0);

        // 4. Marketing Commission (Assume 1.5% of total sales for the exec)
        const marketingCommission = totalSales * 0.015;

        // 5. Managed Partners List
        const managedPartners = partners
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((p: any) => ({
                id: p.partnerCode,
                name: p.name,
                joined: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: p.status || "Active",
                slab: `${p.commissionSlab || 7.5}%`
            }));

        return NextResponse.json({
            success: true,
            metrics: {
                totalPartners,
                activeThisWeek,
                totalRevenueGenerated: totalSales,
                marketingCommission
            },
            managedPartners
        });
    } catch (error) {
        console.error("Marketing Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch marketing stats" }, { status: 500 });
    }
}
