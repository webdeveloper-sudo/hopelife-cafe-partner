import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/partner/stats/route';
import { getSession } from '@/lib/auth';

const { mockPrismaInstance } = vi.hoisted(() => ({
    mockPrismaInstance: {
        partner: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        guest: {
            count: vi.fn(),
        },
        scanLog: {
            findMany: vi.fn(),
        },
        payout: {
            findMany: vi.fn(),
        },
        incomeLog: {
            findMany: vi.fn(),
        },
        systemConfig: {
            findUnique: vi.fn(),
        },
    }
}));

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    getPrisma: vi.fn(() => mockPrismaInstance),
}));

vi.mock('@/lib/retention', () => ({
    evaluateRetentionStreak: vi.fn(),
}));

describe('Partner Stats API Endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 404 if partner is not found', async () => {
        (getSession as any).mockResolvedValue({ role: 'PARTNER', partnerCode: 'INVALID' });
        mockPrismaInstance.partner.findUnique.mockResolvedValue(null);

        const req = new Request('http://localhost:5000/api/partner/stats');
        const response = await GET(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Partner not found');
    });

    it('returns correct metrics for an authenticated partner', async () => {
        const mockPartner = {
            id: 'partner-123',
            partnerCode: 'HOPE123',
            name: 'Test Partner',
            commissionSlab: 10,
            bonusCommission: 2,
            walletTotal: 5000,
            claimedTierBonuses: ['TIER1'],
        };

        (getSession as any).mockResolvedValue({ role: 'PARTNER', partnerCode: 'HOPE123' });
        mockPrismaInstance.partner.findUnique.mockResolvedValue(mockPartner);
        mockPrismaInstance.guest.count.mockResolvedValue(50);
        mockPrismaInstance.scanLog.findMany.mockResolvedValue([
            {
                id: 'scan-1',
                billAmount: 1000,
                partnerCommissionAmount: 120,
                status: 'PAID',
                createdAt: new Date(),
                guest: { partnerId: 'partner-123', name: 'Guest 1' }
            }
        ]);
        mockPrismaInstance.payout.findMany.mockResolvedValue([
            { amount: 1000, status: 'COMPLETED', createdAt: new Date() }
        ]);
        mockPrismaInstance.incomeLog.findMany.mockResolvedValue([]);
        mockPrismaInstance.systemConfig.findUnique.mockResolvedValue({
            tiers: [{ key: 'TIER1', cashBonus: 500 }]
        });

        const req = new Request('http://localhost:5000/api/partner/stats');
        const response = await GET(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.metrics.totalLeads).toBe(50);
        expect(data.metrics.totalCommission).toBe(120);
        expect(data.metrics.totalPaid).toBe(120);
        expect(data.metrics.availableBalance).toBe(5000);
        expect(data.partnerDetails.effectiveSlab).toBe(12);
    });

    it('allows admin to override partnerId via query param', async () => {
        (getSession as any).mockResolvedValue({ role: 'ADMIN', id: 'admin-1' });
        
        const mockPartner = {
            id: 'partner-456',
            partnerCode: 'OVERRIDE',
            name: 'Override Partner',
            commissionSlab: 10,
        };

        mockPrismaInstance.partner.findUnique.mockResolvedValue(mockPartner);
        mockPrismaInstance.guest.count.mockResolvedValue(0);
        mockPrismaInstance.scanLog.findMany.mockResolvedValue([]);
        mockPrismaInstance.payout.findMany.mockResolvedValue([]);
        mockPrismaInstance.incomeLog.findMany.mockResolvedValue([]);
        mockPrismaInstance.systemConfig.findUnique.mockResolvedValue(null);

        const req = new Request('http://localhost:5000/api/partner/stats?partnerId=OVERRIDE');
        const response = await GET(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.partnerDetails.code).toBe('OVERRIDE');
        expect(mockPrismaInstance.partner.findUnique).toHaveBeenCalledWith({
            where: { partnerCode: 'OVERRIDE' }
        });
    });
});
