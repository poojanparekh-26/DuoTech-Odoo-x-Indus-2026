'use strict';

const { findActiveKitchenOrders, updateOrderStatus, findOrderById } = require('../models/orderModel');

// ── GET /api/kitchen/orders ────────────────────────────────────
async function getActiveOrders(req, res) {
    try {
        const orders = await findActiveKitchenOrders();
        return res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error('[getActiveOrders]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch kitchen orders.' });
    }
}

// ── PATCH /api/kitchen/orders/:id/status ──────────────────────
async function updateKitchenOrderStatus(req, res) {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'Order id must be a positive integer.' });
    }

    const validStatuses = ['draft', 'preparing', 'ready', 'served', 'paid'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}.` });
    }

    try {
        const current = await findOrderById(id);
        if (!current) {
            return res.status(404).json({ success: false, message: `Order ${id} not found.` });
        }

        const updated = await updateOrderStatus(id, status);

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully.',
            data: {
                order_id: updated.id,
                status: updated.status,
                updated_at: updated.updated_at
            }
        });
    } catch (err) {
        console.error('[updateKitchenOrderStatus]', err);
        return res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
}

module.exports = {
    getActiveOrders,
    updateKitchenOrderStatus
};
