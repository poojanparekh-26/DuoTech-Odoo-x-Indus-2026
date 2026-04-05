'use strict';

/**
 * models/orderModel.js
 *
 * Raw DB layer — no business logic here.
 * Every function accepts a db client/pool and returns rows.
 */

const pool = require('../db');

// ── Create a bare order row ───────────────────────────────────
async function insertOrder({ tableId, totalAmount, source = 'pos', note = null }, client) {
    const db = client || pool;
    const { rows } = await db.query(
        `INSERT INTO orders (table_id, total_amount, source, note)
         VALUES ($1, $2, $3, $4)
         RETURNING id, table_id, status, total_amount, source, note, created_at`,
        [tableId ?? null, totalAmount, source, note]
    );
    return rows[0];
}

// ── Insert a single order_item row ────────────────────────────
async function insertOrderItem({ orderId, productId, variantId, quantity, unitPrice }, client) {
    const db = client || pool;
    const { rows } = await db.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, order_id, product_id, variant_id, quantity, unit_price, subtotal`,
        [orderId, productId, variantId ?? null, quantity, unitPrice]
    );
    return rows[0];
}

// ── Fetch all orders (summary list) ──────────────────────────
async function findAllOrders() {
    const { rows } = await pool.query(
        `SELECT  o.id,
                 o.table_id,
                 t.table_no,
                 f.name        AS floor_name,
                 o.status,
                 o.total_amount,
                 o.source,
                 o.note,
                 o.created_at,
                 o.updated_at
         FROM    orders  o
         LEFT JOIN tables  t ON t.id = o.table_id
         LEFT JOIN floors  f ON f.id = t.floor_id
         ORDER   BY o.created_at DESC`
    );
    return rows;
}

// ── Fetch one order with its items ────────────────────────────
async function findOrderById(id) {
    // Order header
    const { rows: orderRows } = await pool.query(
        `SELECT  o.id,
                 o.table_id,
                 t.table_no,
                 f.name        AS floor_name,
                 o.status,
                 o.total_amount,
                 o.source,
                 o.note,
                 o.created_at,
                 o.updated_at
         FROM    orders  o
         LEFT JOIN tables  t ON t.id = o.table_id
         LEFT JOIN floors  f ON f.id = t.floor_id
         WHERE   o.id = $1`,
        [id]
    );

    if (orderRows.length === 0) return null;

    // Line items
    const { rows: itemRows } = await pool.query(
        `SELECT  oi.id,
                 oi.product_id,
                 p.name           AS product_name,
                 oi.variant_id,
                 pv.attribute     AS variant_attribute,
                 pv.value         AS variant_value,
                 oi.quantity,
                 oi.unit_price,
                 oi.subtotal,
                 oi.note
         FROM    order_items     oi
         JOIN    products        p  ON p.id  = oi.product_id
         LEFT JOIN product_variants pv ON pv.id = oi.variant_id
         WHERE   oi.order_id = $1
         ORDER   BY oi.id ASC`,
        [id]
    );

    return { ...orderRows[0], items: itemRows };
}

// ── Update order status ───────────────────────────────────────
async function updateOrderStatus(id, status) {
    const { rows } = await pool.query(
        `UPDATE orders
         SET    status     = $1,
                updated_at = NOW()
         WHERE  id         = $2
         RETURNING id, table_id, status, total_amount, source, updated_at`,
        [status, id]
    );
    return rows[0] ?? null;
}

// ── Fetch active kitchen orders ─────────────────────────────────
async function findActiveKitchenOrders() {
    // Orders that are not paid/completed, or based on specific statuses
    const { rows: orderRows } = await pool.query(
        `SELECT  o.id,
                 o.table_id,
                 t.table_no,
                 o.status,
                 o.note,
                 o.created_at
         FROM    orders  o
         LEFT JOIN tables t ON t.id = o.table_id
         WHERE   o.status NOT IN ('paid')
         ORDER   BY o.created_at ASC`
    );

    if (orderRows.length === 0) return [];

    const orderIds = orderRows.map(o => o.id);

    const { rows: itemRows } = await pool.query(
        `SELECT  oi.id,
                 oi.order_id,
                 oi.product_id,
                 p.name           AS product_name,
                 oi.variant_id,
                 pv.attribute     AS variant_attribute,
                 pv.value         AS variant_value,
                 oi.quantity,
                 oi.note
         FROM    order_items     oi
         JOIN    products        p  ON p.id  = oi.product_id
         LEFT JOIN product_variants pv ON pv.id = oi.variant_id
         WHERE   oi.order_id = ANY($1)
         ORDER   BY oi.id ASC`,
        [orderIds]
    );

    // Group items by order
    const itemsByOrder = itemRows.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
    }, {});

    return orderRows.map(order => ({
        ...order,
        items: itemsByOrder[order.id] || []
    }));
}

module.exports = {
    insertOrder,
    insertOrderItem,
    findAllOrders,
    findOrderById,
    updateOrderStatus,
    findActiveKitchenOrders,
};
