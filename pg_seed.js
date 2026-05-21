const { Pool } = require('pg');
const crypto = require('crypto');

const connectionString = "postgresql://neondb_owner:npg_nG5MhfVz9AKy@ep-wispy-hill-a13hjd1n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: connectionString
});

async function main() {
  const password = "123";
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  
  await pool.query(
    "INSERT INTO \"Admin\" (id, email, password, name, role, \"createdAt\") VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (email) DO UPDATE SET password = $3, name = $4, role = $5",
    ['admin-1', 'admin@achariya.org', hashedPassword, 'System Admin', 'SUPER_ADMIN']
  );

  await pool.query(
    "INSERT INTO \"Admin\" (id, email, password, name, role, \"createdAt\") VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (email) DO UPDATE SET password = $3, name = $4, role = $5",
    ['whitetown-admin', 'whitetown@hopecafe.com', hashedPassword, 'HOPE Cafe White Town', 'ADMIN']
  );

  await pool.query(
    "INSERT INTO \"Admin\" (id, email, password, name, role, \"createdAt\") VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (email) DO UPDATE SET password = $3, name = $4, role = $5",
    ['auroville-admin', 'auroville@hopecafe.com', hashedPassword, 'HOPE Cafe Auroville', 'ADMIN']
  );

  console.log("Seeded via pg raw");
}
main().catch(console.error).finally(() => pool.end());
