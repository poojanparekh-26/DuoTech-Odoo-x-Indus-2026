// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\kitchen.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');
const { getIO } = require('../lib/socket');

// ─── GET /api/kitchen/orders ──────────────────────────────────────────────────
const getKitchenOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT
      o.*,
      t.table_number
    FROM orders o
    LEFT JOIN tables t ON t.id = o.table_id
    WHERE o.kitchen_status IN ('TO_COOK', 'PREPARING', 'COMPLETED')
  `;
  const params = [];

  if (status) {
    params.push(status.toUpperCase());
    query += ` AND o.kitchen_status = $${params.length}`;
  }

  query += ' ORDER BY o.created_at ASC';

  const ordersResult = await db(query, params);

  // Attach items to each order
  const orders = await Promise.all(
    ordersResult.rows.map(async (order) => {
      const itemsResult = await db(
        `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );
      return { ...order, items: itemsResult.rows };
    })
  );

  return res.json({ success: true, data: orders });
});

// ─── PUT /api/kitchen/orders/:id/status ───────────────────────────────────────
const updateKitchenStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { kitchenStatus } = req.body;

  if (!kitchenStatus) {
    return res.status(400).json({
      success: false,
      error: 'kitchenStatus is required.',
    });
  }

  const validStatuses = ['PENDING', 'TO_COOK', 'PREPARING', 'COMPLETED'];
  if (!validStatuses.includes(kitchenStatus.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `kitchenStatus must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const result = await db(
    `UPDATE orders
     SET kitchen_status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [kitchenStatus.toUpperCase(), id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  const updatedOrder = result.rows[0];

  // Broadcast to all connected clients (POS + customer display)
  try {
    getIO().emit('order:status-updated', updatedOrder);
  } catch (_) {}

  return res.json({ success: true, data: updatedOrder });
});

// ─── PUT /api/kitchen/orders/:id/items/:itemId ────────────────────────────────
const toggleItemPrepared = asyncHandler(async (req, res) => {
  const { id: orderId, itemId } = req.params;

  const result = await db(
    `UPDATE order_items
     SET is_prepared = NOT is_prepared, updated_at = NOW()
     WHERE id = $1 AND order_id = $2
     RETURNING *`,
    [itemId, orderId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Order item not found.',
    });
  }

  // Optionally check if ALL items for this order are prepared → auto-advance to COMPLETED
  const unpreparedResult = await db(
    `SELECT COUNT(*)::int AS unprepared
     FROM order_items
     WHERE order_id = $1 AND is_prepared = false`,
    [orderId]
  );

  let orderUpdate = null;
  if (unpreparedResult.rows[0].unprepared === 0) {
    // All items prepared → mark order as COMPLETED in kitchen
    const updRes = await db(
      `UPDATE orders
       SET kitchen_status = 'COMPLETED', updated_at = NOW()
       WHERE id = $1 AND kitchen_status = 'PREPARING'
       RETURNING *`,
      [orderId]
    );
    if (updRes.rows.length > 0) {
      orderUpdate = updRes.rows[0];
      try { getIO().emit('order:status-updated', orderUpdate); } catch (_) {}
    }
  }

  return res.json({
    success: true,
    data: {
      item: result.rows[0],
      orderAutoCompleted: !!orderUpdate,
    },
  });
});

module.exports = { getKitchenOrders, updateKitchenStatus, toggleItemPrepared };
