const wishlistModel = require("../models/wishlistModel");

// NOTE: this is dummy sessionId for now (to show commits)
// Later you can replace with real login userId or cookie sessionId
const getSessionId = (req) => req.headers["x-session-id"] || "demo-session";

exports.addToWishlist = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { carId } = req.body;

    if (!carId) {
      return res.status(400).json({ message: "carId is required" });
    }

    const result = await wishlistModel.addToWishlist(sessionId, carId);
    return res.status(201).json({ message: "Added to wishlist", result });
  } catch (err) {
    console.error("addToWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { carId } = req.params;

    const result = await wishlistModel.removeFromWishlist(sessionId, carId);
    return res.status(200).json({ message: "Removed from wishlist", result });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const sessionId = getSessionId(req);

    const data = await wishlistModel.getWishlist(sessionId);
    return res.status(200).json({ wishlist: data });
  } catch (err) {
    console.error("getWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
