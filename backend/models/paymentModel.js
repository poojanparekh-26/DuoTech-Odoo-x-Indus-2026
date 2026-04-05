'use strict';

const pool = require('../db');

async function insertPayment({ order_id, amount, method }, client) {
    const db = client || pool;
    const { rows } = await db.query(
        `INSERT INTO payments (order_id, amount, payment_method)
         VALUES ($1, $2, $3)
         RETURNING id, order_id, amount, payment_method, payment_status, created_at`,
        [order_id, amount, method]
    );
    return rows[0];
}

async function findPaymentsByOrderId(orderId) {
    const { rows } = await pool.query(
        `SELECT id, order_id, amount, payment_method, payment_status, created_at
         FROM payments
         WHERE order_id = $1
         ORDER BY created_at DESC`,
        [orderId]
    );
    return rows;
}

module.exports = {
    insertPayment,
    findPaymentsByOrderId,
};
