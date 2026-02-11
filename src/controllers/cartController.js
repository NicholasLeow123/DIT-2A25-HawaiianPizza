const cartModel = require('../models/cartModel');

// GET /cart
async function getCart(req, res, next) {
  try {
    const cart = await cartModel.getCart();
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

// POST /cart
async function addToCart(req, res, next) {
  try {
    const { productId, name, type, unitPrice, quantity } = req.body;

    const parsedProductId = Number(productId);
    const parsedUnitPrice = Number(unitPrice);
    const parsedQuantity = Number(quantity || 1);

    if (
      Number.isNaN(parsedProductId) ||
      !name ||
      Number.isNaN(parsedUnitPrice)
    ) {
      return res
        .status(400)
        .json({ error: 'productId, name and unitPrice are required and must be valid numbers.' });
    }

    const updatedCart = await cartModel.addItem({
      productId: parsedProductId,
      name,
      type,
      unitPrice: parsedUnitPrice,
      quantity: parsedQuantity,
    });

    res.status(201).json(updatedCart);
  } catch (err) {
    next(err);
  }
}

// POST /cart/checkout
async function checkout(req, res, next) {
  try {
    const result = await cartModel.checkoutCart();
    res.json({
      message: 'Checkout successful.',
      items: result.items,
      totals: result.totals,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /cart
async function removeFromCart(req, res, next) {
  try {
    const { itemType, itemId, quantity } = req.body;

    const parsedItemId = Number(itemId);
    const parsedQuantity = Number(quantity || 1);

    if (!itemType || !['CAR', 'PART'].includes(itemType)) {
      return res.status(400).json({ error: 'itemType must be CAR or PART.' });
    }
    if (Number.isNaN(parsedItemId) || parsedItemId <= 0) {
      return res.status(400).json({ error: 'itemId must be a valid number.' });
    }
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number.' });
    }

    const updatedCart = await cartModel.removeItem({
      itemType,
      itemId: parsedItemId,
      quantity: parsedQuantity,
    });

    res.json(updatedCart);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  checkout,
};