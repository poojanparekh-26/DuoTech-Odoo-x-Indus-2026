'use strict';

/**
 * routes/reports.js
 *
 * GET /api/reports/summary       → Output business summary stats
 * GET /api/reports/top-products  → Output popular products list
 */

const express = require('express');
const { getSummary, getTopProducts } = require('../controllers/reportController');

const router = express.Router();

router.get('/summary', getSummary);
router.get('/top-products', getTopProducts);

module.exports = router;
