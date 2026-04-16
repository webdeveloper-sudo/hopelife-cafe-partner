const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

// Load environment variables manually mimicking prisma.config.ts logic if needed
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^"|"$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const prisma = new PrismaClient({ log: ['info'] });

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

  console.log("Admin account seeded successfully:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
