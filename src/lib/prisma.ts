import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Force clear global prisma instance during development
if (process.env.NODE_ENV !== "production") {
    delete (global as any).prisma;
}

const globalForPrisma = global as unknown as { prisma: any };

const createPrismaClient = () => {
    let connectionString = process.env.DATABASE_URL;
    if (typeof connectionString !== "string" || connectionString.length < 20) {
        connectionString = "postgresql://neondb_owner:npg_nG5MhfVz9AKy@ep-wispy-hill-a13hjd1n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool) as any;

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
};

const basePrisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

/**
 * Extend Prisma to include compatibility fields and aliases
 * 1. Map 'createdAt' to 'joinedAt' for Partner model (used in legacy UI/API)
 * 2. Export model aliases (Partner, Guest, etc.) to match previous mock casing
 */
export const prisma = basePrisma.$extends({
    result: {
        partner: {
            joinedAt: {
                needs: { createdAt: true },
                compute(partner: any) {
                    return partner.createdAt;
                },
            },
        },
    },
});

// Model Aliases for backward compatibility with the existing codebase
(prisma as any).Partner = (prisma as any).partner;
(prisma as any).Guest = (prisma as any).guest;
(prisma as any).ScanLog = (prisma as any).scanLog;
(prisma as any).Payout = (prisma as any).payout;
(prisma as any).DynamicQr = (prisma as any).dynamicQR;
(prisma as any).DynamicQR = (prisma as any).dynamicQR;
(prisma as any).dynamicQr = (prisma as any).dynamicQR;

/**
 * Utility function to get the prisma instance
 */
export function getPrisma() {
    return prisma;
}

export default prisma;
