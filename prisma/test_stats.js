const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join('f:', 'App', 'Hope Cofe', 'dev.db');
const db = new Database(dbPath);

async function testStats() {
    try {
        const partnerId = 'demo';
        console.log("Fetching partner:", partnerId);

        const partner = db.prepare(`SELECT * FROM Partner WHERE partnerCode = ?`).get(partnerId);
        if (!partner) {
            console.log("Partner not found");
            return;
        }

        console.log("Partner ID:", partner.id);

        const totalLeadsRow = db.prepare(`SELECT COUNT(*) as count FROM Guest WHERE partnerId = ?`).get(partner.id);
        const totalLeads = totalLeadsRow.count;
        console.log("Total Leads:", totalLeads);

        const statuses = ["SETTLED", "PAID"];
        const query = `SELECT * FROM ScanLog WHERE status IN (?, ?)`;
        const allScanLogs = db.prepare(query).all(...statuses);
        console.log("Total ScanLogs found:", allScanLogs.length);

        for (const log of allScanLogs) {
            log.guest = db.prepare(`SELECT * FROM Guest WHERE id = ?`).get(log.guestId);
        }

        const scanLogs = allScanLogs
            .filter((log) => log.guest?.partnerId === partner.id)
            .sort((a, b) => b.createdAt - a.createdAt);

        console.log("Filtered ScanLogs:", scanLogs.length);

        let totalCommission = 0;
        let totalSales = 0;
        let totalPaid = 0;

        const recentReferrals = scanLogs.slice(0, 50).map((log) => {
            const comm = log.partnerCommissionAmount || (log.billAmount * (partner.commissionSlab / 100));
            totalCommission += comm;
            totalSales += log.billAmount;
            if (log.status === "PAID") totalPaid += comm;
            return { id: log.id, commission: comm };
        });

        console.log("Metrics:", {
            totalLeads,
            totalCommission,
            totalSales,
            totalPaid,
            totalOwed: totalCommission - totalPaid
        });

        const payouts = db.prepare(`SELECT * FROM Payout WHERE partnerId = ?`).all(partner.id);
        console.log("Payouts found:", payouts.length);

        console.log("SUCCESS: Stats calculation worked.");

    } catch (err) {
        console.error("ERROR in stats calculation:", err);
    } finally {
        db.close();
    }
}

testStats();
