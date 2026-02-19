// Categories router for the search filter, ai assisted

const express = require('express');
const router = express.Router();
const { listCategories } = require('../controllers/categoryController');

router.get('/', listCategories);

module.exports = router;