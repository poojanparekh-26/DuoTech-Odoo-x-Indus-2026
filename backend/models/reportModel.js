'use strict';

const pool = require('../db');

async function getSummaryStats() {
    const { rows } = await pool.query(`
        SELECT 
            COUNT(id) AS total_orders,
            COALESCE(SUM(total_amount), 0) AS total_revenue,
            COALESCE(AVG(total_amount), 0) AS average_order_value
        FROM orders
        WHERE status != 'cancelled'
    `);
    
    return {
        total_orders: Number(rows[0].total_orders),
        total_revenue: Number(rows[0].total_revenue),
        average_order_value: Number(rows[0].average_order_value)
    };
}

async function getTopProductsStats() {
    const { rows } = await pool.query(`
        SELECT 
            p.name AS product_name,
            SUM(oi.quantity) AS quantity_sold,
            SUM(oi.subtotal) AS revenue_generated
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.status != 'cancelled'
        GROUP BY p.id, p.name
        ORDER BY quantity_sold DESC
        LIMIT 10
    `);

    return rows.map(row => ({
        product_name: row.product_name,
        quantity_sold: Number(row.quantity_sold),
        revenue_generated: Number(row.revenue_generated)
    }));
}

module.exports = {
    getSummaryStats,
    getTopProductsStats
};
