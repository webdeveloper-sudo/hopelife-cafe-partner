export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "MARKETING") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const prisma = getPrisma();
        
        const rep = await prisma.marketingRep.findUnique({
            where: { id: session.id },
            include: {
                partners: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!rep) {
            return NextResponse.json({ error: "Rep not found" }, { status: 404 });
        }

        const totalPartners = rep.partners.length;
        
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const activeThisWeek = rep.partners.filter(p => new Date(p.createdAt) >= startOfWeek).length;
        
        const activePartnersCount = rep.partners.filter(p => p.status === "ACTIVE").length;

        const managedPartners = rep.partners.map(p => ({
            id: p.id,
            name: p.name,
            joined: p.createdAt.toLocaleDateString(),
            status: p.status,
            slab: `${p.commissionSlab}%`,
            mobile: p.mobile,
            contactName: p.contactName
        }));

        return NextResponse.json({
            success: true,
            metrics: {
                totalPartners,
                activeThisWeek,
                activePartnersCount
            },
            managedPartners
        });
    } catch (err: any) {
        console.error("Marketing Stats Error:", err);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
