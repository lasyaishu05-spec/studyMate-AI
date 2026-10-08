const { PrismaClient } = require('@prisma/client');

// Singleton pattern to avoid multiple instances in development (hot-reload safe)
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;