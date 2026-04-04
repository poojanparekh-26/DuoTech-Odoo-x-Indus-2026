'use strict';

/**
 * routes/orders.js
 *
 * POST   /api/orders              → create order from cart
 * GET    /api/orders              → list all orders
 * GET    /api/orders/:id          → single order with items
 * PATCH  /api/orders/:id/status   → advance order status
 */

const express = require('express');
const {
    createOrder,
    listOrders,
    getOrderById,
    patchOrderStatus,
    payOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/',               createOrder);
router.get('/',                listOrders);
router.get('/:id',             getOrderById);
router.patch('/:id/status',    patchOrderStatus);
router.patch('/:id/pay',       payOrder);

module.exports = router;
