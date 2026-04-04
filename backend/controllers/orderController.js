'use strict';

/**
 * controllers/orderController.js
 *
 * Business logic layer.
 * Validates input → runs DB operations inside a transaction → shapes the response.
 */

const pool = require('../db');
const {
    insertOrder,
    insertOrderItem,
    findAllOrders,
    findOrderById,
    updateOrderStatus,
} = require('../models/orderModel');

// Valid status transitions — enforces forward-only progression
const STATUS_TRANSITIONS = {
    draft:     ['confirmed', 'preparing'],
    confirmed: ['preparing'],
    preparing: ['ready', 'completed'],
    ready:     ['completed'],
    completed: ['paid'],
    paid:      [],   // terminal state
};

// ── POST /api/orders ──────────────────────────────────────────
async function createOrder(req, res) {
    const { table_id, items, source = 'pos', note } = req.body;

    // ── Input Validation ──────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'items must be a non-empty array.',
        });
    }

    for (let i = 0; i < items.length; i++) {
        const { product_id, quantity, unit_price } = items[i];

        if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
            return res.status(400).json({
                success: false,
                message: `items[${i}].product_id is required and must be a positive integer.`,
            });
        }
        if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: `items[${i}].quantity must be a positive integer.`,
            });
        }
        if (unit_price === undefined || isNaN(parseFloat(unit_price)) || parseFloat(unit_price) < 0) {
            return res.status(400).json({
                success: false,
                message: `items[${i}].unit_price must be a non-negative number.`,
            });
        }
    }

    // ── Calculate total_amount from items ─────────────────────
    const totalAmount = items.reduce(
        (sum, { quantity, unit_price }) => sum + Number(quantity) * Number(unit_price),
        0
    );

    // ── Run everything in a single transaction ────────────────
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert order header
        const order = await insertOrder(
            {
                tableId:     table_id ?? null,
                totalAmount: totalAmount.toFixed(2),
                source,
                note:        note ?? null,
            },
            client
        );

        // 2. Insert each line item
        const insertedItems = [];
        for (const item of items) {
            const row = await insertOrderItem(
                {
                    orderId:   order.id,
                    productId: Number(item.product_id),
                    variantId: item.variant_id ? Number(item.variant_id) : null,
                    quantity:  Number(item.quantity),
                    unitPrice: Number(item.unit_price),
                },
                client
            );
            insertedItems.push(row);
        }

        await client.query('COMMIT');

        return res.status(201).json({
            success:      true,
            order_id:     order.id,
            status:       order.status,
            total_amount: Number(order.total_amount),
            source:       order.source,
            created_at:   order.created_at,
            items:        insertedItems,
        });
    } catch (err) {
        await client.query('ROLLBACK');

        // FK violation: product or variant doesn't exist
        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'One or more product_id / variant_id values do not exist.',
            });
        }
        console.error('[createOrder]', err);
        return res.status(500).json({ success: false, message: 'Failed to create order.' });
    } finally {
        client.release();
    }
}

// ── GET /api/orders ───────────────────────────────────────────
async function listOrders(req, res) {
    try {
        const rows = await findAllOrders();
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('[listOrders]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
}

// ── GET /api/orders/:id ───────────────────────────────────────
async function getOrderById(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'Order id must be a positive integer.' });
    }

    try {
        const order = await findOrderById(id);

        if (!order) {
            return res.status(404).json({ success: false, message: `Order ${id} not found.` });
        }

        return res.status(200).json({ success: true, data: order });
    } catch (err) {
        console.error('[getOrderById]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
    }
}

// ── PATCH /api/orders/:id/status ──────────────────────────────
async function patchOrderStatus(req, res) {
    const id     = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'Order id must be a positive integer.' });
    }

    const allStatuses = Object.keys(STATUS_TRANSITIONS);
    if (!status || !allStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `status must be one of: ${allStatuses.join(', ')}.`,
        });
    }

    try {
        // Fetch current status to validate transition
        const current = await findOrderById(id);
        if (!current) {
            return res.status(404).json({ success: false, message: `Order ${id} not found.` });
        }

        const allowed = STATUS_TRANSITIONS[current.status];
        if (!allowed.includes(status)) {
            return res.status(409).json({
                success: false,
                message: `Cannot transition order from "${current.status}" to "${status}". ` +
                         `Allowed next statuses: [${allowed.join(', ') || 'none'}].`,
            });
        }

        const updated = await updateOrderStatus(id, status);

        return res.status(200).json({
            success:      true,
            order_id:     updated.id,
            status:       updated.status,
            total_amount: Number(updated.total_amount),
            updated_at:   updated.updated_at,
        });
    } catch (err) {
        console.error('[patchOrderStatus]', err);
        return res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
}

module.exports = {
    createOrder,
    listOrders,
    getOrderById,
    patchOrderStatus,
};
