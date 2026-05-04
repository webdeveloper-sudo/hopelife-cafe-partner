import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { getPrisma } from '@/lib/prisma';
import crypto from 'crypto';

// Use vi.hoisted to define the mock object so it's available inside vi.mock
const { mockPrismaInstance } = vi.hoisted(() => ({
    mockPrismaInstance: {
        admin: {
            findUnique: vi.fn(),
        },
        partner: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
        },
        marketingRep: {
            findUnique: vi.fn(),
        },
    }
}));

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    login: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    getPrisma: vi.fn(() => mockPrismaInstance),
}));

// Helper to create a Request object
const createRequest = (body: any) => {
    return new Request('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
};

describe('Login API Endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 for invalid admin credentials', async () => {
        mockPrismaInstance.admin.findUnique.mockResolvedValue(null);

        const req = createRequest({
            role: 'ADMIN',
            email: 'admin@example.com',
            password: 'wrongpassword',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid admin credentials');
    });

    it('successfully logs in an admin with correct credentials', async () => {
        const password = 'correctpassword';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        
        mockPrismaInstance.admin.findUnique.mockResolvedValue({
            id: 'admin-id',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        });

        const req = createRequest({
            role: 'ADMIN',
            email: 'admin@example.com',
            password: password,
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.redirectUrl).toBe('/super-admin/dashboard');
    });

    it('returns 404 for non-existent partner', async () => {
        mockPrismaInstance.partner.findFirst.mockResolvedValue(null);

        const req = createRequest({
            role: 'PARTNER',
            email: 'partner@example.com',
            password: 'password',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Partner account not found');
    });

    it('successfully logs in a partner with correct credentials', async () => {
        const password = 'partnerpassword';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        
        mockPrismaInstance.partner.findFirst.mockResolvedValue({
            id: 'partner-id',
            email: 'partner@example.com',
            password: hashedPassword,
            partnerCode: 'HOPE001',
        });

        const req = createRequest({
            role: 'PARTNER',
            email: 'partner@example.com',
            password: password,
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.partnerCode).toBe('HOPE001');
    });

    it('returns 403 for inactive marketing representative', async () => {
        mockPrismaInstance.marketingRep.findUnique.mockResolvedValue({
            id: 'marketing-id',
            email: 'marketing@example.com',
            status: 'INACTIVE',
            password: 'hashedpassword'
        });

        const req = createRequest({
            role: 'MARKETING',
            email: 'marketing@example.com',
            password: 'password',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Marketing account is inactive');
    });

    it('returns 400 for invalid role', async () => {
        const req = createRequest({
            role: 'INVALID_ROLE',
            email: 'test@example.com',
            password: 'password',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid role specified');
    });
});
