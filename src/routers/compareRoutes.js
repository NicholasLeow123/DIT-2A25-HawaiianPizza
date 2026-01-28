// src/routers/compareRoutes.js
const express = require("express");
const router = express.Router();
const compareController = require("../controllers/compareController.js");

router.post("/", compareController.add);
router.delete("/reset", compareController.reset);
router.get("/current", compareController.getSelected);
router.post("/summary", compareController.summary);


module.exports = router;
