// Using require to bypass Turbopack's ESM-based aliasing of @prisma/client to Edge-runtime version
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

module.exports = { prisma };
