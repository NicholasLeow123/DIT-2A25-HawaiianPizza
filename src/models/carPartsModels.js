const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllCarParts() {
  return prisma.carParts.findMany({
    orderBy: { id: 'asc' }
  });
}

async function getCarParts(carPartsid) {
  return prisma.carParts.findFirst({
    where: { id: carPartsid }
  });
}

module.exports = {
  getAllCarParts,
  getCarParts
};