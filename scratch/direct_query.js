const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_nG5MhfVz9AKy@ep-wispy-hill-a13hjd1n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    });

    try {
        await client.connect();
        const res = await client.query('SELECT "failureReason", "createdAt" FROM "Payout" WHERE status = \'FAILED\' ORDER BY "createdAt" DESC LIMIT 3');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
