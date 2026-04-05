// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\customer.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── GET /api/customers ───────────────────────────────────────────────────────
const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT * FROM customers WHERE 1=1';
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
  }

  // Total count for pagination metadata
  const countResult = await db(
    `SELECT COUNT(*)::int AS total FROM customers WHERE 1=1${
      search ? ` AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)` : ''
    }`,
    search ? [`%${search}%`] : []
  );

  query += ' ORDER BY created_at DESC';

  params.push(parseInt(limit));
  query += ` LIMIT $${params.length}`;

  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const result = await db(query, params);

  return res.json({
    success: true,
    data: result.rows,
    pagination: {
      total: countResult.rows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
    },
  });
});

// ─── POST /api/customers ──────────────────────────────────────────────────────
const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, city, state, country } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }

  const result = await db(
    `INSERT INTO customers (id, name, email, phone, city, state, country)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      name.trim(),
      email   || null,
      phone   || null,
      city    || null,
      state   || null,
      country || null,
    ]
  );

  return res.status(201).json({ success: true, data: result.rows[0] });
});

// ─── GET /api/customers/:id ───────────────────────────────────────────────────
const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customerResult = await db(
    'SELECT * FROM customers WHERE id = $1',
    [id]
  );

  if (customerResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Customer not found.' });
  }

  // Last 10 orders for this customer
  const ordersResult = await db(
    `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [id]
  );

  return res.json({
    success: true,
    data: {
      ...customerResult.rows[0],
      recentOrders: ordersResult.rows,
    },
  });
});

// ─── PUT /api/customers/:id ───────────────────────────────────────────────────
const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, city, state, country } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }

  const result = await db(
    `UPDATE customers
     SET
       name       = $1,
       email      = $2,
       phone      = $3,
       city       = $4,
       state      = $5,
       country    = $6,
       updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [
      name.trim(),
      email   || null,
      phone   || null,
      city    || null,
      state   || null,
      country || null,
      id,
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Customer not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

module.exports = { getCustomers, createCustomer, getCustomerById, updateCustomer };
