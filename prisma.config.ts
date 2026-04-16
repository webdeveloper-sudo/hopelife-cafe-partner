import { defineConfig } from "prisma/config";
import path from "path";
import * as fs from "fs";

// Manually load .env file since prisma.config.ts runs outside Next.js context
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

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
