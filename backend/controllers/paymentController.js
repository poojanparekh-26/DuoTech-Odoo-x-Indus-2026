'use strict';

const pool = require('../db');
const { insertPayment, findPaymentsByOrderId } = require('../models/paymentModel');
const { findOrderById, updateOrderStatus } = require('../models/orderModel');

// ── POST /api/payments ─────────────────────────────────────────
async function createPayment(req, res) {
    const { order_id, amount, method } = req.body;

    if (!order_id || isNaN(parseInt(order_id, 10))) {
        return res.status(400).json({ success: false, message: 'Valid order_id is required.' });
    }
    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'amount must be a positive number.' });
    }
    const validMethods = ['cash', 'card', 'upi'];
    if (!method || !validMethods.includes(method)) {
        return res.status(400).json({ success: false, message: `method must be one of: ${validMethods.join(', ')}.` });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Verify order exists
        const order = await findOrderById(order_id);
        if (!order) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: `Order ${order_id} not found.` });
        }

        // 2. Create the payment record
        const payment = await insertPayment({
            order_id: parseInt(order_id, 10),
            amount: parseFloat(amount),
            method
        }, client);

        // 3. Update order status to paid
        // Assuming updateOrderStatus doesn't require a client object for transaction
        // Wait, orderModel's updateOrderStatus uses pool directly, not client!
        // So we just execute the raw SQL here to ensure it's in the transaction
        await client.query(
            `UPDATE orders
             SET status = 'paid', updated_at = NOW()
             WHERE id = $1`,
            [order_id]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: payment
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[createPayment]', err);
        return res.status(500).json({ success: false, message: 'Failed to process payment.' });
    } finally {
        client.release();
    }
}

// ── GET /api/payments/:orderId ─────────────────────────────────
async function getPaymentsByOrder(req, res) {
    const orderId = parseInt(req.params.orderId, 10);

    if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({ success: false, message: 'Valid orderId is required.' });
    }

    try {
        const payments = await findPaymentsByOrderId(orderId);
        return res.status(200).json({ success: true, data: payments });
    } catch (err) {
        console.error('[getPaymentsByOrder]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
    }
}

module.exports = {
    createPayment,
    getPaymentsByOrder
};
