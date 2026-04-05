'use strict';

const pool = require('../db');
const { getFullMenu } = require('../models/menuModel');
const { insertOrder, insertOrderItem } = require('../models/orderModel');

// ── GET /api/menu ──────────────────────────────────────────────
async function fetchMenu(req, res) {
    try {
        const menu = await getFullMenu();
        return res.status(200).json({ success: true, data: menu });
    } catch (err) {
        console.error('[fetchMenu]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch menu.' });
    }
}

// ── POST /api/qr-order ─────────────────────────────────────────
async function createQrOrder(req, res) {
    const { table_id, items } = req.body;

    if (!table_id || isNaN(parseInt(table_id, 10))) {
        return res.status(400).json({ success: false, message: 'Valid table_id is required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'items must be a non-empty array.' });
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
        const { product_id, quantity, unit_price } = items[i];
        if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
            return res.status(400).json({ success: false, message: `items[${i}].product_id is required.` });
        }
        if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({ success: false, message: `items[${i}].quantity must be positive.` });
        }
        if (unit_price === undefined || isNaN(parseFloat(unit_price)) || parseFloat(unit_price) < 0) {
            return res.status(400).json({ success: false, message: `items[${i}].unit_price must be non-negative.` });
        }
    }

    const totalAmount = items.reduce(
        (sum, { quantity, unit_price }) => sum + Number(quantity) * Number(unit_price),
        0
    );

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert order with source 'qr'
        const order = await insertOrder(
            {
                tableId: parseInt(table_id, 10),
                totalAmount: totalAmount.toFixed(2),
                source: 'qr',
                note: 'QR Order'
            },
            client
        );

        // Insert order items
        const insertedItems = [];
        for (const item of items) {
            const row = await insertOrderItem(
                {
                    orderId:   order.id,
                    productId: Number(item.product_id),
                    variantId: item.variant_id ? Number(item.variant_id) : null,
                    quantity:  Number(item.quantity),
                    unitPrice: Number(item.unit_price)
                },
                client
            );
            insertedItems.push(row);
        }

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Order created successfully via QR',
            data: {
                order_id: order.id,
                status: order.status,
                total_amount: Number(order.total_amount),
                created_at: order.created_at,
                items: insertedItems
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[createQrOrder]', err);
        return res.status(500).json({ success: false, message: 'Failed to create QR order.' });
    } finally {
        client.release();
    }
}

module.exports = {
    fetchMenu,
    createQrOrder
};
