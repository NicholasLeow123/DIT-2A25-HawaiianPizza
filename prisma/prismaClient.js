//prismaClient connection for the filter category
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;