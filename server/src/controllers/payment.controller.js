// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\payment.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');
const { generateUPIQRCode } = require('../utils/upiQR');
const { getIO } = require('../lib/socket');

// ─── GET /api/payments ────────────────────────────────────────────────────────
const getPayments = asyncHandler(async (req, res) => {
  const { sessionId, orderId } = req.query;

  let query = `
    SELECT
      p.*,
      pm.name AS method_name,
      pm.type AS method_type,
      o.order_number
    FROM payments p
    LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
    LEFT JOIN orders          o  ON o.id  = p.order_id
    WHERE 1=1
  `;
  const params = [];

  if (sessionId) {
    params.push(sessionId);
    query += ` AND p.session_id = $${params.length}`;
  }
  if (orderId) {
    params.push(orderId);
    query += ` AND p.order_id = $${params.length}`;
  }

  query += ' ORDER BY p.created_at DESC';

  const result = await db(query, params);
  return res.json({ success: true, data: result.rows });
});

// ─── POST /api/payments ───────────────────────────────────────────────────────
const createPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethodId, amount, reference, sessionId } = req.body;

  if (!orderId || !paymentMethodId || amount === undefined) {
    return res.status(400).json({
      success: false,
      error: 'orderId, paymentMethodId, and amount are required.',
    });
  }

  // Verify order exists
  const orderCheck = await db(
    'SELECT id, total, status FROM orders WHERE id = $1',
    [orderId]
  );
  if (orderCheck.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }
  if (orderCheck.rows[0].status === 'PAID') {
    return res.status(400).json({ success: false, error: 'Order is already paid.' });
  }

  // Insert payment with COMPLETED status
  const paymentResult = await db(
    `INSERT INTO payments
       (id, order_id, payment_method_id, session_id, amount, status, reference)
     VALUES
       (gen_random_uuid(), $1, $2, $3, $4, 'COMPLETED', $5)
     RETURNING *`,
    [
      orderId,
      paymentMethodId,
      sessionId  || null,
      amount,
      reference  || null,
    ]
  );
  const payment = paymentResult.rows[0];

  // Check if order is fully paid
  const paidResult = await db(
    `SELECT COALESCE(SUM(amount), 0) AS total_paid
     FROM payments
     WHERE order_id = $1 AND status = 'COMPLETED'`,
    [orderId]
  );

  const totalPaid  = Number(paidResult.rows[0].total_paid);
  const orderTotal = Number(orderCheck.rows[0].total);

  let updatedOrder = null;
  if (totalPaid >= orderTotal) {
    const updateResult = await db(
      `UPDATE orders
       SET status = 'PAID', is_paid = true, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );
    updatedOrder = updateResult.rows[0];

    // Notify customer display
    try {
      getIO().to('customer-display').emit('customer:order-update', updatedOrder);
    } catch (_) {}
  }

  return res.status(201).json({
    success: true,
    data: {
      payment,
      orderFullyPaid: totalPaid >= orderTotal,
      order: updatedOrder,
    },
  });
});

// ─── PUT /api/payments/:id ────────────────────────────────────────────────────
const updatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reference } = req.body;

  const result = await db(
    `UPDATE payments
     SET
       status     = COALESCE($1, status),
       reference  = COALESCE($2, reference),
       updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [
      status    ? status.toUpperCase() : null,
      reference || null,
      id,
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Payment not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

// ─── POST /api/payments/upi-qr ────────────────────────────────────────────────
const generateUpiQr = asyncHandler(async (req, res) => {
  const { amount, upiId, orderNumber } = req.body;

  if (!amount || !upiId || !orderNumber) {
    return res.status(400).json({
      success: false,
      error: 'amount, upiId, and orderNumber are required.',
    });
  }

  const qrData = await generateUPIQRCode(upiId, amount, orderNumber);

  return res.json({ success: true, data: qrData });
});

module.exports = { getPayments, createPayment, updatePayment, generateUpiQr };
