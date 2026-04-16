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
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
