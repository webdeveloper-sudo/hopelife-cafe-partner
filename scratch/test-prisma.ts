import { getPrisma } from "./src/lib/prisma";

async function test() {
    const prisma = getPrisma();
    console.log("Prisma models:", Object.keys(prisma).filter(k => typeof (prisma as any)[k] === 'object'));
    console.log("systemConfig exists:", !!(prisma as any).systemConfig);
    console.log("SystemConfig exists:", !!(prisma as any).SystemConfig);
}

test();
