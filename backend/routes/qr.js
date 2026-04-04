'use strict';

/**
 * routes/qr.js
 *
 * GET  /api/menu       → Fetch structured menu (categories, products, variants)
 * POST /api/qr-order   → Create a new order from a QR scan
 */

const express = require('express');
const { fetchMenu, createQrOrder } = require('../controllers/qrController');

const router = express.Router();

router.get('/menu', fetchMenu);
router.post('/qr-order', createQrOrder);

module.exports = router;
