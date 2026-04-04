'use strict';

/**
 * routes/payments.js
 *
 * POST  /api/payments          → Create a payment and set order to paid
 * GET   /api/payments/:orderId → Get all payments for a specific order
 */

const express = require('express');
const {
    createPayment,
    getPaymentsByOrder
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/', createPayment);
router.get('/:orderId', getPaymentsByOrder);

module.exports = router;
