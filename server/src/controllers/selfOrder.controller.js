// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\selfOrder.controller.js

const { db, pool } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');
const { generateSelfOrderToken } = require('../utils/selfOrderToken');
const { generateOrderNumber } = require('../utils/orderNumber');
const { getIO } = require('../lib/socket');

// ─── Helper: calculate totals from items ──────────────────────────────────────
function calcTotals(items) {
  let subtotal  = 0;
  let taxAmount = 0;

  for (const item of items) {
    const qty      = Number(item.quantity);
    const price    = Number(item.price);
    const tax      = Number(item.tax ?? 0);
    const discount = Number(item.discount ?? 0);

    subtotal  += price * qty - discount;
    taxAmount += (tax / 100) * price * qty;
  }

  return {
    subtotal:  Math.round(subtotal  * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total:     Math.round((subtotal + taxAmount) * 100) / 100,
  };
}

// ─── POST /api/self-order/token ───────────────────────────────────────────────
// Called by staff when they generate a QR code for a table
const generateToken = asyncHandler(async (req, res) => {
  const { tableId, sessionId } = req.body;

  if (!tableId) {
    return res.status(400).json({ success: false, error: 'tableId is required.' });
  }

  // Verify table exists
  const tableCheck = await db(
    'SELECT id, table_number FROM tables WHERE id = $1 AND is_active = true',
    [tableId]
  );
  if (tableCheck.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Table not found or inactive.' });
  }

  const token       = generateSelfOrderToken();
  const orderNumber = generateOrderNumber();

  // Create a DRAFT order with the self-order token attached
  const result = await db(
    `INSERT INTO orders
       (id, order_number, session_id, table_id, self_order_token,
        subtotal, tax_amount, total)
     VALUES
       (gen_random_uuid(), $1, $2, $3, $4, 0, 0, 0)
     RETURNING *`,
    [orderNumber, sessionId || null, tableId, token]
  );

  const order = result.rows[0];

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const qrUrl     = `${clientUrl}/self-order/${token}`;

  return res.status(201).json({
    success: true,
    data: {
      token,
      tableId,
      tableNumber: tableCheck.rows[0].table_number,
      orderId: order.id,
      qrUrl,
    },
  });
});

// ─── GET /api/self-order/:token ───────────────────────────────────────────────
// Customer-facing: load their session
const getOrderByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find the draft order for this token
  const orderResult = await db(
    `SELECT o.*, t.table_number
     FROM orders o
     LEFT JOIN tables t ON t.id = o.table_id
     WHERE o.self_order_token = $1`,
    [token]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Invalid or expired self-order token.',
    });
  }

  const order = orderResult.rows[0];

  // Fetch current order items
  const itemsResult = await db(
    `SELECT oi.*, p.name AS product_name
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.created_at ASC`,
    [order.id]
  );

  // Fetch active menu
  const productsResult = await db(
    `SELECT
       p.*,
       c.name  AS category_name,
       c.color AS category_color
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.is_active = true
     ORDER BY c.name ASC, p.name ASC`
  );

  // Attach variants to each product
  const products = await Promise.all(
    productsResult.rows.map(async (product) => {
      const variantsResult = await db(
        'SELECT * FROM product_variants WHERE product_id = $1',
        [product.id]
      );
      return { ...product, variants: variantsResult.rows };
    })
  );

  return res.json({
    success: true,
    data: {
      order:       { ...order, items: itemsResult.rows },
      products,
      tableNumber: order.table_number,
    },
  });
});

// ─── POST /api/self-order/:token/order ───────────────────────────────────────
// Customer submits / adds items to their order
const addItemsByToken = asyncHandler(async (req, res) => {
  const { token }     = req.params;
  const { items = [] } = req.body;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'items array must not be empty.',
    });
  }

  // Find the order by token
  const orderLookup = await db(
    `SELECT * FROM orders WHERE self_order_token = $1 AND status = 'DRAFT'`,
    [token]
  );

  if (orderLookup.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Invalid token or order is no longer accepting items.',
    });
  }

  const existingOrder = orderLookup.rows[0];

  // Fetch existing items to recalculate totals accurately
  const existingItemsResult = await db(
    'SELECT * FROM order_items WHERE order_id = $1',
    [existingOrder.id]
  );

  const allItems = [
    // Map existing items to the same shape as incoming
    ...existingItemsResult.rows.map((i) => ({
      quantity: i.quantity,
      price:    i.price,
      tax:      i.tax,
      discount: i.discount,
    })),
    ...items,
  ];

  const { subtotal, taxAmount, total } = calcTotals(allItems);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update order totals
    const updatedOrderResult = await client.query(
      `UPDATE orders
       SET subtotal = $1, tax_amount = $2, total = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [subtotal, taxAmount, total, existingOrder.id]
    );
    const updatedOrder = updatedOrderResult.rows[0];

    // Insert new items
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
          existingOrder.id,
          item.productId || null,
          item.variantId || null,
          item.name,
          qty,
          price,
          item.tax     ?? 0,
          discount,
          itemSubtotal,
          item.notes   || null,
        ]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    // Fetch all items for the response
    const allItemsResult = await db(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [existingOrder.id]
    );

    const fullOrder = { ...updatedOrder, items: allItemsResult.rows };

    // Notify kitchen
    try {
      getIO().to('kitchen').emit('kitchen:new-order', fullOrder);
    } catch (_) {}

    return res.json({ success: true, data: fullOrder });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = { generateToken, getOrderByToken, addItemsByToken };
