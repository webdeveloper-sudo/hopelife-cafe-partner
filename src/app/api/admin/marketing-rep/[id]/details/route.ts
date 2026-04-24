import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const prisma = getPrisma();

        // 1. Fetch Marketing Rep Basic Info
        const rep = await prisma.marketingRep.findUnique({
            where: { id },
            include: {
                partners: {
                    select: {
                        id: true,
                        name: true,
                        partnerCode: true,
                        createdAt: true,
                        status: true,
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!rep) {
            return NextResponse.json({ error: "Marketing Representative not found" }, { status: 404 });
        }

        // 2. Aggregate Metrics
        const totalPartners = rep.partners.length;
        
        // Dates for progress calculations
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const partnersThisMonth = rep.partners.filter((p: any) => new Date(p.createdAt) >= startOfMonth).length;
        const partnersThisWeek = rep.partners.filter((p: any) => new Date(p.createdAt) >= startOfWeek).length;

        // 3. Weekly Progress (Last 7 Days)
        const weeklyProgress = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            const dayStart = new Date(d.setHours(0, 0, 0, 0));
            const dayEnd = new Date(d.setHours(23, 59, 59, 999));

            const dayOnboarded = rep.partners.filter((p: any) => {
                const created = new Date(p.createdAt);
                return created >= dayStart && created <= dayEnd;
            }).length;

            weeklyProgress.push({
                name: dateStr,
                count: dayOnboarded
            });
        }

        // 4. Monthly Progress (Last 6 Months)
        const monthlyProgress = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

            const monthOnboarded = rep.partners.filter((p: any) => {
                const created = new Date(p.createdAt);
                return created >= monthStart && created <= monthEnd;
            }).length;

            monthlyProgress.push({
                name: monthStr,
                count: monthOnboarded
            });
        }

        return NextResponse.json({
            success: true,
            rep: {
                id: rep.id,
                name: rep.name,
                email: rep.email,
                mobile: rep.mobile,
                status: rep.status,
                createdAt: rep.createdAt,
            },
            metrics: {
                totalPartners,
                partnersThisMonth,
                partnersThisWeek,
            },
            partners: rep.partners,
            weeklyProgress,
            monthlyProgress
        });

    } catch (error) {
        console.error("Marketing Rep Detail API Error:", error);
        return NextResponse.json({ error: "Failed to fetch marketing rep details" }, { status: 500 });
    }
}
