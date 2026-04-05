// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\customerOrder.controller.js

const { db, pool } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');
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

// ─── POST /api/customer-orders ────────────────────────────────────────────────
// Public endpoint for customers to place custom orders
const createCustomerOrder = asyncHandler(async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    items = [],
    total = 0,
  } = req.body;

  // Validation
  if (!customer_name || !customer_name.trim()) {
    return res.status(400).json({ success: false, error: 'Customer name is required.' });
  }
  if (items.length === 0) {
    return res.status(400).json({ success: false, error: 'Order must have at least one item.' });
  }

  const orderNumber = generateOrderNumber();

  // First, try to find or create a customer record
  let customerId = null;
  if (customer_email || customer_phone) {
    const customerCheck = await db(
      `SELECT id FROM customers 
       WHERE (email = $1 OR phone = $2) AND email IS NOT NULL
       LIMIT 1`,
      [customer_email || null, customer_phone || null]
    );

    if (customerCheck.rows.length > 0) {
      customerId = customerCheck.rows[0].id;
    } else {
      const newCustomer = await db(
        `INSERT INTO customers (id, name, email, phone, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         RETURNING id`,
        [customer_name, customer_email || null, customer_phone || null]
      );
      customerId = newCustomer.rows[0].id;
    }
  }

  // Calculate totals from items
  const { subtotal, taxAmount, total: calculatedTotal } = calcTotals(items);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert order (no session_id or table_id for customer orders)
    const orderResult = await client.query(
      `INSERT INTO orders
         (id, order_number, customer_id, subtotal, tax_amount, total, type, status)
       VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5, 'CUSTOM', 'PENDING')
       RETURNING *`,
      [orderNumber, customerId || null, subtotal, taxAmount, calculatedTotal]
    );
    const order = orderResult.rows[0];

    // Insert order items
    const insertedItems = [];
    for (const item of items) {
      const qty      = Number(item.quantity);
      const price    = Number(item.price);
      const discount = Number(item.discount ?? 0);
      const itemSubtotal = Math.round((price * qty - discount) * 100) / 100;

      const itemResult = await client.query(
        `INSERT INTO order_items
           (id, order_id, product_id, name, quantity, price, tax, discount, subtotal, notes)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          order.id,
          item.product_id || null,
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

    const fullOrder = { ...order, items: insertedItems };

    // Notify kitchen via Socket.io
    try {
      getIO().to('kitchen').emit('kitchen:new-order', fullOrder);
    } catch (_) {
      // Socket not fatal
    }

    return res.status(201).json({
      success: true,
      data: {
        id: fullOrder.id,
        order_number: fullOrder.order_number,
        customer_name,
        customer_email,
        customer_phone,
        items: fullOrder.items,
        total: fullOrder.total,
        created_at: fullOrder.created_at,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = { createCustomerOrder };
