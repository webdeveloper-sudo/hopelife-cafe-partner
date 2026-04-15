import path from "path";

// --- Environment Detection ---
const isNetlify = process.env.NETLIFY === "true" ||
    process.env.NODE_ENV === "production" ||
    !!process.env.VERCEL;

// --- Hardcoded Seed Data (Fallback for Production/Netlify) ---
const DEMO_DATA = {
    "partners": [
        {
            "id": "demo-id",
            "partnerCode": "demo",
            "name": "Grand Hope Cafe (Demo)",
            "email": "demo@partner.hub",
            "mobile": "0000000000",
            "commissionSlab": 7.5
        },
        {
            "id": "p_1772277716048",
            "name": "Hope Cafe North",
            "contactName": "Test",
            "mobile": "9442266704",
            "email": null,
            "partnerCode": "HOTNEW6047",
            "commissionSlab": 7.5,
            "status": "ACTIVE",
            "walletBalance": 500,
            "joinedAt": "2026-02-28T11:21:56.048Z"
        }
    ],
    "guests": [
        {
            "id": "g_1772272097440",
            "name": "Simulated User",
            "mobileNumber": "9123456789",
            "partnerId": "demo-id",
            "createdAt": "2026-02-28T09:48:17.440Z"
        },
        {
            "id": "g_1772272291059",
            "name": "Fresh User",
            "mobileNumber": "9988776655",
            "partnerId": "demo-id",
            "createdAt": "2026-02-28T09:51:31.059Z"
        }
    ],
    "scanLogs": [],
    "dynamicQRs": [],
    "payouts": []
};

// --- Database Engine Initialization ---
let db: any = null;
let memoryStore: any = JSON.parse(JSON.stringify(DEMO_DATA)); // Initial seed

// DYNAMIC ENGINE LOADING: Completely isolated to prevent Netlify bundler 500 errors
if (!isNetlify) {
    try {
        // We use dynamic require inside a block that is NEVER analyzed by the static bundler for production
        const path = require("path");
        const Database = require("better-sqlite3");
        const DB_FILE = path.join(process.cwd(), "dev.db");
        db = new Database(DB_FILE);
        db.pragma('journal_mode = WAL');
    } catch (e) {
        // Silently fall back to memoryStore locally if fail
        db = null;
    }
}

// --- Universal Prisma Mock Implementation ---
export const prisma: any = {
    partner: {
        findUnique: async ({ where }: any) => {
            if (db) {
                const row = db.prepare(`SELECT * FROM Partner WHERE id = ? OR partnerCode = ? OR mobile = ? OR email = ?`).get(
                    where.id || null,
                    where.partnerCode || null,
                    where.mobile || null,
                    where.email || null
                );
                return row || null;
            }
            return memoryStore.partners.find((p: any) =>
                p.id === where.id || p.partnerCode === where.partnerCode || p.mobile === where.mobile || p.email === where.email
            ) || null;
        },
        findFirst: async ({ where }: any) => {
            if (db) {
                const row = db.prepare(`SELECT * FROM Partner WHERE email = ? OR mobile = ? OR partnerCode = ? OR id = ?`).get(
                    where.email || null,
                    where.mobile || null,
                    where.partnerCode || null,
                    where.id || null
                );
                return row || null;
            }
            return memoryStore.partners.find((p: any) =>
                p.email === where.email || p.mobile === where.mobile || p.partnerCode === where.partnerCode || p.id === where.id
            ) || null;
        },
        create: async ({ data }: any) => {
            const id = data.id || `p_${Date.now()}`;
            if (db) {
                const stmt = db.prepare(`
                    INSERT INTO Partner (id, partnerCode, name, email, mobile, commissionSlab, guestDiscountSlab, status, walletBalance, joinedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                stmt.run(
                    id,
                    data.partnerCode,
                    data.name,
                    data.email || null,
                    data.mobile,
                    data.commissionSlab || 7.5,
                    data.guestDiscountSlab || data.commissionSlab || 7.5,
                    data.status || "PENDING",
                    data.walletBalance || 0,
                    new Date().getTime()
                );
            }
            const newPartner = { id, ...data, joinedAt: new Date().toISOString() };
            memoryStore.partners.push(newPartner);
            return newPartner;
        },
        update: async ({ where, data }: any) => {
            if (db) {
                const prev = db.prepare(`SELECT * FROM Partner WHERE id = ? OR partnerCode = ?`).get(where.id || null, where.partnerCode || null);
                if (!prev) return null;
                const fields = Object.keys(data).map(k => `${k} = ?`).join(", ");
                const values = Object.values(data);
                const stmt = db.prepare(`UPDATE Partner SET ${fields} WHERE id = ? OR partnerCode = ?`);
                stmt.run(...values, where.id || null, where.partnerCode || null);
                return { ...prev, ...data };
            }
            const idx = memoryStore.partners.findIndex((p: any) => p.id === where.id || p.partnerCode === where.partnerCode);
            if (idx === -1) return null;
            memoryStore.partners[idx] = { ...memoryStore.partners[idx], ...data };
            return memoryStore.partners[idx];
        },
        findMany: async () => {
            if (db) return db.prepare(`SELECT * FROM Partner`).all();
            return memoryStore.partners;
        }
    },
    guest: {
        findMany: async ({ where, include }: any = {}) => {
            if (db) {
                let query = `SELECT * FROM Guest`;
                const params: any[] = [];
                if (where?.partnerId) {
                    query += ` WHERE partnerId = ?`;
                    params.push(where.partnerId);
                }
                const rows: any[] = db.prepare(query).all(...params);

                if (include?.partner) {
                    for (const r of rows) {
                        r.partner = db.prepare(`SELECT * FROM Partner WHERE id = ?`).get(r.partnerId);
                    }
                }
                if (include?.dynamicQr) {
                    for (const r of rows) {
                        r.dynamicQr = db.prepare(`SELECT * FROM DynamicQR WHERE guestId = ?`).get(r.id);
                        if (r.dynamicQr) r.dynamicQr.expiresAt = new Date(r.dynamicQr.expiresAt);
                    }
                }
                return rows;
            }

            let guests = [...memoryStore.guests];
            if (where?.partnerId) guests = guests.filter(g => g.partnerId === where.partnerId);

            return guests.map(g => {
                const res = { ...g };
                if (include?.partner) res.partner = memoryStore.partners.find((p: any) => p.id === g.partnerId);
                if (include?.dynamicQr) res.dynamicQr = (memoryStore.dynamicQRs || []).find((q: any) => q.guestId === g.id);
                return res;
            });
        },
        findUnique: async ({ where, include }: any) => {
            if (db) {
                const row: any = db.prepare(`SELECT * FROM Guest WHERE id = ? OR mobileNumber = ?`).get(
                    where.id || null,
                    where.mobileNumber || null
                );
                if (!row) return null;
                if (include?.partner) {
                    row.partner = db.prepare(`SELECT * FROM Partner WHERE id = ?`).get(row.partnerId);
                }
                if (include?.dynamicQr) {
                    row.dynamicQr = db.prepare(`SELECT * FROM DynamicQR WHERE guestId = ?`).get(row.id);
                    if (row.dynamicQr) {
                        row.dynamicQr.expiresAt = new Date(row.dynamicQr.expiresAt);
                    }
                }
                return row;
            }

            const guest = memoryStore.guests.find((g: any) => g.id === where.id || g.mobileNumber === where.mobileNumber);
            if (!guest) return null;
            const res = { ...guest };
            if (include?.partner) res.partner = memoryStore.partners.find((p: any) => p.id === guest.partnerId);
            if (include?.dynamicQr) res.dynamicQr = (memoryStore.dynamicQRs || []).find((q: any) => q.guestId === guest.id);
            return res;
        },
        count: async ({ where }: any) => {
            if (db) {
                const row: any = db.prepare(`SELECT COUNT(*) as count FROM Guest WHERE partnerId = ?`).get(where?.partnerId);
                return row.count;
            }
            return memoryStore.guests.filter((g: any) => g.partnerId === where?.partnerId).length;
        },
        create: async ({ data }: any) => {
            const id = data.id || `g_${Date.now()}`;
            if (db) {
                const stmt = db.prepare(`INSERT INTO Guest (id, name, mobileNumber, partnerId, createdAt) VALUES (?, ?, ?, ?, ?)`);
                stmt.run(id, data.name, data.mobileNumber, data.partnerId, new Date().getTime());
            }
            const newGuest = { id, ...data, createdAt: new Date() };
            memoryStore.guests.push(newGuest);
            return newGuest;
        }
    },
    scanLog: {
        findMany: async ({ where, include }: any = {}) => {
            if (db) {
                let query = `SELECT * FROM ScanLog`;
                const params: any[] = [];
                const conditions: string[] = [];
                if (where?.status) {
                    if (typeof where.status === 'object' && where.status.in) {
                        conditions.push(`status IN (${where.status.in.map(() => "?").join(",")})`);
                        params.push(...where.status.in);
                    } else {
                        conditions.push(`status = ?`);
                        params.push(where.status);
                    }
                }
                if (where?.guest?.partnerId) {
                    conditions.push(`guestId IN (SELECT id FROM Guest WHERE partnerId = ?)`);
                    params.push(where.guest.partnerId);
                }
                if (conditions.length > 0) query += ` WHERE ` + conditions.join(" AND ");
                const rows: any[] = db.prepare(query).all(...params);
                return rows.map(r => {
                    const res = { ...r, createdAt: new Date(r.createdAt) };
                    if (include?.guest) res.guest = db.prepare(`SELECT * FROM Guest WHERE id = ?`).get(r.guestId);
                    return res;
                });
            }

            let logs = [...(memoryStore.scanLogs || [])];
            if (where?.status) {
                const statusList = (typeof where.status === 'object' && where.status.in) ? where.status.in : [where.status];
                logs = logs.filter(l => statusList.includes(l.status));
            }
            if (where?.guest?.partnerId) {
                const partnerGuestIds = memoryStore.guests.filter((g: any) => g.partnerId === where.guest.partnerId).map((g: any) => g.id);
                logs = logs.filter(l => partnerGuestIds.includes(l.guestId));
            }
            return logs.map(l => {
                const res = { ...l, createdAt: new Date(l.createdAt) };
                if (include?.guest) res.guest = memoryStore.guests.find((g: any) => g.id === l.guestId);
                return res;
            });
        },
        findFirst: async ({ where }: any) => {
            if (db) {
                let query = `SELECT * FROM ScanLog WHERE guestId = ?`;
                const params: any[] = [where.guestId];
                if (where?.createdAt?.gte) {
                    query += ` AND createdAt >= ?`;
                    params.push(new Date(where.createdAt.gte).getTime());
                }
                query += ` ORDER BY createdAt DESC LIMIT 1`;
                const row: any = db.prepare(query).get(...params);
                return row ? { ...row, createdAt: new Date(row.createdAt) } : null;
            }

            let logs = (memoryStore.scanLogs || []).filter((l: any) => l.guestId === where.guestId);
            if (where?.createdAt?.gte) {
                const gte = new Date(where.createdAt.gte).getTime();
                logs = logs.filter((l: any) => new Date(l.createdAt).getTime() >= gte);
            }
            logs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return logs[0] ? { ...logs[0], createdAt: new Date(logs[0].createdAt) } : null;
        },
        create: async ({ data }: any) => {
            const id = data.id || `s_${Date.now()}`;
            const now = new Date();
            if (db) {
                const stmt = db.prepare(`
                    INSERT INTO ScanLog (id, guestId, adminId, billAmount, discountAmount, guestDiscountAmount, partnerCommissionAmount, status, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                stmt.run(id, data.guestId, data.adminId, data.billAmount, data.discountAmount, data.guestDiscountAmount || 0, data.partnerCommissionAmount || 0, data.status || "SETTLED", now.getTime());
            }
            const newLog = { id, ...data, createdAt: now };
            if (!memoryStore.scanLogs) memoryStore.scanLogs = [];
            memoryStore.scanLogs.push(newLog);
            return newLog;
        },
        updateMany: async ({ where, data }: any) => {
            if (db) {
                let query = `UPDATE ScanLog SET status = ? WHERE 1=1`;
                const params: any[] = [data.status];
                if (where.id?.in) {
                    query += ` AND id IN (${where.id.in.map(() => "?").join(",")})`;
                    params.push(...where.id.in);
                }
                if (where.status) {
                    query += ` AND status = ?`;
                    params.push(where.status);
                }
                const info = db.prepare(query).run(...params);
                return { count: info.changes };
            }

            let count = 0;
            (memoryStore.scanLogs || []).forEach((l: any) => {
                let match = true;
                if (where.id?.in && !where.id.in.includes(l.id)) match = false;
                if (where.status && l.status !== where.status) match = false;
                if (match) {
                    l.status = data.status;
                    count++;
                }
            });
            return { count };
        }
    },
    dynamicQr: {
        findUnique: async ({ where }: any) => {
            if (db) {
                const row: any = db.prepare(`SELECT * FROM DynamicQR WHERE id = ? OR guestId = ?`).get(where.id || null, where.guestId || null);
                if (!row) return null;
                return { ...row, expiresAt: new Date(row.expiresAt) };
            }
            const qr = (memoryStore.dynamicQRs || []).find((q: any) => q.id === where.id || q.guestId === where.guestId);
            return qr ? { ...qr, expiresAt: new Date(qr.expiresAt) } : null;
        },
        upsert: async ({ where, create, update }: any) => {
            if (db) {
                const existing: any = db.prepare(`SELECT * FROM DynamicQR WHERE guestId = ?`).get(where.guestId);
                if (existing) {
                    const { id: _, ...updateData } = update;
                    const fields = Object.keys(updateData).map(k => `${k} = ?`).join(", ");
                    const values = Object.values(updateData).map(v => v instanceof Date ? v.getTime() : v);
                    db.prepare(`UPDATE DynamicQR SET ${fields} WHERE guestId = ?`).run(...values, where.guestId);
                    return { ...existing, ...updateData, expiresAt: new Date(update.expiresAt || existing.expiresAt) };
                } else {
                    const id = create.id || `q_${Date.now()}`;
                    db.prepare(`INSERT INTO DynamicQR (id, guestId, secretKey, expiresAt) VALUES (?, ?, ?, ?)`).run(id, create.guestId, create.secretKey, new Date(create.expiresAt).getTime());
                    return { id, ...create, expiresAt: new Date(create.expiresAt) };
                }
            }

            if (!memoryStore.dynamicQRs) memoryStore.dynamicQRs = [];
            const idx = memoryStore.dynamicQRs.findIndex((q: any) => q.guestId === where.guestId);
            if (idx !== -1) {
                memoryStore.dynamicQRs[idx] = { ...memoryStore.dynamicQRs[idx], ...update };
                return { ...memoryStore.dynamicQRs[idx], expiresAt: new Date(memoryStore.dynamicQRs[idx].expiresAt) };
            } else {
                const id = create.id || `q_${Date.now()}`;
                const newQr = { id, ...create };
                memoryStore.dynamicQRs.push(newQr);
                return { ...newQr, expiresAt: new Date(newQr.expiresAt) };
            }
        }
    },
    payout: {
        create: async ({ data }: any) => {
            const id = data.id || `payout_${Date.now()}`;
            const now = new Date();
            if (db) {
                const stmt = db.prepare(`INSERT INTO Payout (id, partnerId, amount, status, method, logsCount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                stmt.run(id, data.partnerId, data.amount, data.status || "COMPLETED", data.method || "BANK_TRANSFER", data.logsCount || 0, now.getTime());
            }
            const newPayout = { id, ...data, createdAt: now };
            if (!memoryStore.payouts) memoryStore.payouts = [];
            memoryStore.payouts.push(newPayout);
            return newPayout;
        },
        findMany: async ({ where }: any = {}) => {
            if (db) {
                let query = `SELECT * FROM Payout`;
                const params: any[] = [];
                if (where?.partnerId) {
                    query += ` WHERE partnerId = ?`;
                    params.push(where.partnerId);
                }
                const rows: any[] = db.prepare(query).all(...params);
                return rows.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
            }
            let payouts = [...(memoryStore.payouts || [])];
            if (where?.partnerId) payouts = payouts.filter(p => p.partnerId === where.partnerId);
            return payouts.map(p => ({ ...p, createdAt: new Date(p.createdAt) }));
        }
    }
};

// Aliases for casing compatibility
prisma.Partner = prisma.partner;
prisma.Guest = prisma.guest;
prisma.ScanLog = prisma.scanLog;
prisma.Payout = prisma.payout;
prisma.DynamicQr = prisma.dynamicQr;
prisma.dynamicQR = prisma.dynamicQr;
prisma.DynamicQR = prisma.dynamicQr;

export function getPrisma() {
    return prisma;
}
