const express = require('express');
const router = express.Router();
const carsPartsControllers = require('../controllers/carPartsControllers');

// GET /api/carParts/search
router.get('/search', carsPartsControllers.searchCarParts);

// GET all cars
router.get('/', carsPartsControllers.getAllCarParts);

// GET one car part by carPartsid
router.get('/:carPartsid', carsPartsControllers.getCarParts);


module.exports = router;