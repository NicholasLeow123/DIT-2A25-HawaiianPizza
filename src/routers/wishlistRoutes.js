const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

// Add to wishlist
router.post("/", wishlistController.addToWishlist);

// Remove from wishlist
router.delete("/:carId", wishlistController.removeFromWishlist);

// Get wishlist
router.get("/", wishlistController.getWishlist);

module.exports = router;