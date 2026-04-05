// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\order.controller.js

const { db, pool } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');
const { generateOrderNumber } = require('../utils/orderNumber');
const { getIO } = require('../lib/socket');

// ─── Helper: fetch items for an order ─────────────────────────────────────────
async function fetchItems(orderId) {
  const result = await db(
    `SELECT oi.*, p.name AS product_name
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.created_at ASC`,
    [orderId]
  );
  return result.rows;
}

// ─── Helper: calculate order totals from items array ─────────────────────────
function calcTotals(items) {
  let subtotal  = 0;
  let taxAmount = 0;

  for (const item of items) {
    const qty      = Number(item.quantity);
    const price    = Number(item.price);
    const tax      = Number(item.tax ?? 0);
    const discount = Number(item.discount ?? 0);

    const lineSubtotal = price * qty - discount;
    const lineTax      = (tax / 100) * price * qty;

    subtotal  += lineSubtotal;
    taxAmount += lineTax;
  }

  const total = subtotal + taxAmount;
  return {
    subtotal:  Math.round(subtotal  * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total:     Math.round(total     * 100) / 100,
  };
}

// ─── GET /api/orders ──────────────────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  const { sessionId, status, tableId } = req.query;

  let query = `
    SELECT
      o.*,
      t.table_number,
      c.name AS customer_name,
      u.name AS user_name
    FROM orders o
    LEFT JOIN tables    t ON t.id = o.table_id
    LEFT JOIN customers c ON c.id = o.customer_id
    LEFT JOIN users     u ON u.id = o.user_id
    WHERE 1=1
  `;
  const params = [];

  if (sessionId) {
    params.push(sessionId);
    query += ` AND o.session_id = $${params.length}`;
  }
  if (status) {
    params.push(status.toUpperCase());
    query += ` AND o.status = $${params.length}`;
  }
  if (tableId) {
    params.push(tableId);
    query += ` AND o.table_id = $${params.length}`;
  }

  query += ' ORDER BY o.created_at DESC';

  const ordersResult = await db(query, params);

  // Attach items to every order
  const orders = await Promise.all(
    ordersResult.rows.map(async (order) => ({
      ...order,
      items: await fetchItems(order.id),
    }))
  );

  return res.json({ success: true, data: orders });
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const {
    sessionId,
    tableId,
    customerId,
    notes,
    items = [],
  } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'sessionId is required.' });
  }
  if (items.length === 0) {
    return res.status(400).json({ success: false, error: 'Order must have at least one item.' });
  }

  const orderNumber = generateOrderNumber();
  const { subtotal, taxAmount, total } = calcTotals(items);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert order
    const orderResult = await client.query(
      `INSERT INTO orders
         (id, order_number, session_id, table_id, customer_id, user_id,
          subtotal, tax_amount, total, notes, kitchen_status)
       VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'TO_COOK')
       RETURNING *`,
      [
        orderNumber,
        sessionId,
        tableId    || null,
        customerId || null,
        req.user.userId,
        subtotal,
        taxAmount,
        total,
        notes || null,
      ]
    );
    const order = orderResult.rows[0];

    // 2. Insert order items
    const insertedItems = [];
    for (const item of items) {
      const qty      = Number(item.quantity);
      const price    = Number(item.price);
      const discount = Number(item.discount ?? 0);
      const itemSubtotal = price * qty - discount;

      const itemResult = await client.query(
        `INSERT INTO order_items
           (id, order_id, product_id, variant_id, name, quantity, price, tax, discount, subtotal, notes)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          order.id,
          item.productId  || null,
          item.variantId  || null,
          item.name,
          qty,
          price,
          item.tax        ?? 0,
          discount,
          Math.round(itemSubtotal * 100) / 100,
          item.notes      || null,
        ]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    const fullOrder = { ...order, items: insertedItems };

    // 3. Notify kitchen via Socket.io
    try {
      getIO().to('kitchen').emit('kitchen:new-order', fullOrder);
    } catch (_) {
      // Socket not fatal — order is already committed
    }

    return res.status(201).json({ success: true, data: fullOrder });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const orderResult = await db(
    `SELECT
       o.*,
       t.table_number,
       c.name AS customer_name
     FROM orders o
     LEFT JOIN tables    t ON t.id = o.table_id
     LEFT JOIN customers c ON c.id = o.customer_id
     WHERE o.id = $1`,
    [id]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  const [items, payments] = await Promise.all([
    fetchItems(id),
    db(
      `SELECT p.*, pm.name AS method_name
       FROM payments p
       LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
       WHERE p.order_id = $1
       ORDER BY p.created_at ASC`,
      [id]
    ),
  ]);

  return res.json({
    success: true,
    data: {
      ...orderResult.rows[0],
      items,
      payments: payments.rows,
    },
  });
});

// ─── PUT /api/orders/:id ──────────────────────────────────────────────────────
const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { kitchenStatus, status, items } = req.body;

  // ── Update kitchen status ─────────────────────────────────────────────────
  if (kitchenStatus) {
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
    try { getIO().emit('order:status-updated', updatedOrder); } catch (_) {}
    return res.json({ success: true, data: updatedOrder });
  }

  // ── Mark order as PAID ────────────────────────────────────────────────────
  if (status === 'PAID') {
    const result = await db(
      `UPDATE orders
       SET status = 'PAID', is_paid = true, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    const updatedOrder = result.rows[0];
    try { getIO().to('customer-display').emit('customer:order-update', updatedOrder); } catch (_) {}
    return res.json({ success: true, data: updatedOrder });
  }

  // ── Update items + recalculate totals ─────────────────────────────────────
  if (items && Array.isArray(items)) {
    const { subtotal, taxAmount, total } = calcTotals(items);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `UPDATE orders
         SET subtotal = $1, tax_amount = $2, total = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [subtotal, taxAmount, total, id]
      );

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }

      // Delete old items and re-insert
      await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);

      const insertedItems = [];
      for (const item of items) {
        const qty      = Number(item.quantity);
        const price    = Number(item.price);
        const discount = Number(item.discount ?? 0);
        const itemSubtotal = Math.round((price * qty - discount) * 100) / 100;

        const itemResult = await client.query(
          `INSERT INTO order_items
             (id, order_id, product_id, variant_id, name, quantity, price, tax, discount, subtotal, notes)
           VALUES
             (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            id,
            item.productId || null,
            item.variantId || null,
            item.name,
            qty,
            price,
            item.tax       ?? 0,
            discount,
            itemSubtotal,
            item.notes     || null,
          ]
        );
        insertedItems.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');
      return res.json({
        success: true,
        data: { ...orderResult.rows[0], items: insertedItems },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return res.status(400).json({
    success: false,
    error: 'Provide kitchenStatus, status, or items to update.',
  });
});

// ─── DELETE /api/orders/:id ───────────────────────────────────────────────────
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Fetch current status first
  const existing = await db(
    'SELECT status FROM orders WHERE id = $1',
    [id]
  );

  if (existing.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }
  if (existing.rows[0].status !== 'DRAFT') {
    return res.status(400).json({
      success: false,
      error: 'Only draft orders can be cancelled.',
    });
  }

  const result = await db(
    `UPDATE orders
     SET status = 'CANCELLED', updated_at = NOW()
     WHERE id = $1
     RETURNING id, order_number, status`,
    [id]
  );

  return res.json({ success: true, data: result.rows[0] });
});

module.exports = { getOrders, createOrder, getOrderById, updateOrder, deleteOrder };
