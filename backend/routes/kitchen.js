'use strict';

/**
 * routes/kitchen.js
 *
 * GET   /api/kitchen/orders          → Get active un-paid orders
 * PATCH /api/kitchen/orders/:id/status → Update order status manually
 */

const express = require('express');
const { getActiveOrders, updateKitchenOrderStatus } = require('../controllers/kitchenController');

const router = express.Router();

router.get('/orders', getActiveOrders);
router.patch('/orders/:id/status', updateKitchenOrderStatus);

module.exports = router;
