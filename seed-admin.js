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
  console.log("White Town Admin seeded successfully:", wtAdmin.email);

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
  console.log("Auroville Admin seeded successfully:", avAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
