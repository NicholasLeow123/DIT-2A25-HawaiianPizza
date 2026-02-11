const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Discounts:
// < 250000          -> 0%
// >= 250000 & <500k -> 10%
// >= 500000         -> 15%

function getDiscountRate(subtotal) {
  if (subtotal >= 500000) return 0.15;
  if (subtotal >= 250000) return 0.1;
  return 0;
}

function calculateTotals(items) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const discountRate = getDiscountRate(subtotal);
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  return { subtotal, discountRate, discountAmount, total };
}

function availableStock(product) {
  return product.stock_total - product.stock_reserved - product.stock_sold;
}

async function getCart() {
  const items = await prisma.cartItem.findMany({
    orderBy: { createdAt: 'asc' },
  });
  const totals = calculateTotals(items);
  return { items, totals };
}

// Helper: fetch product + choose stock update target
async function fetchProductForItem(tx, itemType, itemId) {
  if (itemType === 'CAR') {
    const car = await tx.cars.findUnique({ where: { id: itemId } });
    if (!car) throw new Error('Car not found.');
    return { product: car, table: 'cars', idField: 'carId' };
  }

  const part = await tx.carParts.findUnique({ where: { id: itemId } });
  if (!part) throw new Error('Car part not found.');
  return { product: part, table: 'carParts', idField: 'partId' };
}

// Add / merge item in cart + RESERVE stock
async function addItem({ itemType, itemId, quantity = 1 }) {
  if (!itemType || !['CAR', 'PART'].includes(itemType)) {
    throw new Error('Invalid itemType.');
  }

  return prisma.$transaction(async (tx) => {
    const { product, table, idField } = await fetchProductForItem(tx, itemType, itemId);

    const avail = availableStock(product);
    if (avail < quantity) {
      throw new Error(`Not enough stock. Available: ${avail}`);
    }

    // Reserve stock
    await tx[table].update({
      where: { id: itemId },
      data: { stock_reserved: { increment: quantity } },
    });

    // Upsert cart item (keyed by itemType + carId/partId)
    const whereClause =
      itemType === 'CAR'
        ? { itemType, carId: itemId }
        : { itemType, partId: itemId };

    const existing = await tx.cartItem.findFirst({ where: whereClause });

    // NOTE: your schema stores name/unitPrice as required.
    // If you later add numeric price fields, replace unitPrice here.
    const name = product.name || (itemType === 'CAR' ? 'Car' : 'Part');
    const unitPrice = 0;

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await tx.cartItem.create({
        data: {
          itemType,
          [idField]: itemId,
          name,
          unitPrice,
          quantity,
        },
      });
    }

    const items = await tx.cartItem.findMany({ orderBy: { createdAt: 'asc' } });
    const totals = calculateTotals(items);
    return { items, totals };
  });
}

// Remove / decrement item in cart + RELEASE stock
async function removeItem({ itemType, itemId, quantity = 1 }) {
  if (!itemType || !['CAR', 'PART'].includes(itemType)) {
    throw new Error('Invalid itemType.');
  }

  return prisma.$transaction(async (tx) => {
    const { table, idField } = await fetchProductForItem(tx, itemType, itemId);

    const whereClause =
      itemType === 'CAR'
        ? { itemType, carId: itemId }
        : { itemType, partId: itemId };

    const existing = await tx.cartItem.findFirst({ where: whereClause });
    if (!existing) {
      throw new Error('Item not in cart.');
    }

    const removeQty = Math.min(quantity, existing.quantity);

    // Release reserved stock
    await tx[table].update({
      where: { id: itemId },
      data: { stock_reserved: { decrement: removeQty } },
    });

    if (existing.quantity - removeQty <= 0) {
      await tx.cartItem.delete({ where: { id: existing.id } });
    } else {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { decrement: removeQty } },
      });
    }

    const items = await tx.cartItem.findMany({ orderBy: { createdAt: 'asc' } });
    const totals = calculateTotals(items);
    return { items, totals };
  });
}

// Checkout: CONVERT reserved -> sold, then clear cart
async function checkoutCart() {
  return prisma.$transaction(async (tx) => {
    const items = await tx.cartItem.findMany({ orderBy: { createdAt: 'asc' } });
    const totals = calculateTotals(items);

    // Convert reserved -> sold
    for (const item of items) {
      if (item.itemType === 'CAR') {
        await tx.cars.update({
          where: { id: item.carId },
          data: {
            stock_reserved: { decrement: item.quantity },
            stock_sold: { increment: item.quantity },
          },
        });
      } else {
        await tx.carParts.update({
          where: { id: item.partId },
          data: {
            stock_reserved: { decrement: item.quantity },
            stock_sold: { increment: item.quantity },
          },
        });
      }
    }

    await tx.cartItem.deleteMany({});
    return { items, totals };
  });
}

module.exports = {
  getCart,
  addItem,
  removeItem,
  checkoutCart,
};
