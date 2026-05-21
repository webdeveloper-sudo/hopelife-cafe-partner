import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_nG5MhfVz9AKy@ep-wispy-hill-a13hjd1n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool) as any;
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = "admin@achariya.org";
    const password = "123";
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const admin = await prisma.admin.upsert({
        where: { email },
        update: { password: hashedPassword, name: "System Admin" },
        create: {
            email,
            password: hashedPassword,
            name: "System Admin",
        },
    });
    console.log("Seeded:", admin);

    // Seed White Town Cafe Admin
    const wtEmail = "whitetown@hopecafe.com";
    const wtPassword = "123";
    const wtHashedPassword = crypto.createHash("sha256").update(wtPassword).digest("hex");
    const wtAdmin = await prisma.admin.upsert({
        where: { email: wtEmail },
        update: { password: wtHashedPassword, name: "HOPE Cafe White Town", role: "ADMIN" },
        create: {
            email: wtEmail,
            password: wtHashedPassword,
            name: "HOPE Cafe White Town",
            role: "ADMIN",
        },
    });
    console.log("Seeded White Town Admin:", wtAdmin);

    // Seed Auroville Cafe Admin
    const avEmail = "auroville@hopecafe.com";
    const avPassword = "123";
    const avHashedPassword = crypto.createHash("sha256").update(avPassword).digest("hex");
    const avAdmin = await prisma.admin.upsert({
        where: { email: avEmail },
        update: { password: avHashedPassword, name: "HOPE Cafe Auroville", role: "ADMIN" },
        create: {
            email: avEmail,
            password: avHashedPassword,
            name: "HOPE Cafe Auroville",
            role: "ADMIN",
        },
    });
    console.log("Seeded Auroville Admin:", avAdmin);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
