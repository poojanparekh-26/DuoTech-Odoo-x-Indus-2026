// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\session.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── GET /api/sessions ────────────────────────────────────────────────────────
const getSessions = asyncHandler(async (req, res) => {
  const { posId, status } = req.query;

  let query = `
    SELECT
      s.*,
      u.name  AS user_name,
      pc.name AS pos_name
    FROM sessions s
    LEFT JOIN users      u  ON u.id  = s.user_id
    LEFT JOIN pos_configs pc ON pc.id = s.pos_id
    WHERE 1=1
  `;
  const params = [];

  if (posId) {
    params.push(posId);
    query += ` AND s.pos_id = $${params.length}`;
  }

  if (status) {
    params.push(status.toUpperCase());
    query += ` AND s.status = $${params.length}`;
  }

  query += ' ORDER BY s.created_at DESC';

  const result = await db(query, params);
  return res.json({ success: true, data: result.rows });
});

// ─── POST /api/sessions ───────────────────────────────────────────────────────
const createSession = asyncHandler(async (req, res) => {
  const { posId, openingCash } = req.body;

  if (!posId) {
    return res.status(400).json({ success: false, error: 'posId is required.' });
  }

  // Guard: only one OPEN session per POS
  const existing = await db(
    `SELECT id FROM sessions WHERE pos_id = $1 AND status = 'OPEN'`,
    [posId]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'A session is already open for this POS.',
    });
  }

  const result = await db(
    `INSERT INTO sessions (id, pos_id, user_id, opening_cash, opened_at)
     VALUES (gen_random_uuid(), $1, $2, $3, NOW())
     RETURNING *`,
    [posId, req.user.userId, openingCash ?? 0]
  );

  return res.status(201).json({ success: true, data: result.rows[0] });
});

// ─── GET /api/sessions/:id ────────────────────────────────────────────────────
const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Session with user + POS name
  const sessionResult = await db(
    `SELECT
       s.*,
       u.name  AS user_name,
       pc.name AS pos_name
     FROM sessions s
     LEFT JOIN users       u  ON u.id  = s.user_id
     LEFT JOIN pos_configs pc ON pc.id = s.pos_id
     WHERE s.id = $1`,
    [id]
  );

  if (sessionResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Session not found.' });
  }

  // Summary of paid orders in this session
  const summaryResult = await db(
    `SELECT
       COUNT(*)::int          AS order_count,
       COALESCE(SUM(total), 0) AS total_sales
     FROM orders
     WHERE session_id = $1 AND status = 'PAID'`,
    [id]
  );

  return res.json({
    success: true,
    data: {
      ...sessionResult.rows[0],
      summary: summaryResult.rows[0],
    },
  });
});

// ─── PUT /api/sessions/:id ────────────────────────────────────────────────────
const updateSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, closingCash } = req.body;

  // ── Close session ─────────────────────────────────────────────────────────
  if (status === 'CLOSED') {
    // Calculate total sales from paid orders
    const salesResult = await db(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM orders
       WHERE session_id = $1 AND status = 'PAID'`,
      [id]
    );
    const totalSales = salesResult.rows[0].total;

    const result = await db(
      `UPDATE sessions
       SET
         status       = 'CLOSED',
         closing_cash = $1,
         total_sales  = $2,
         closed_at    = NOW(),
         updated_at   = NOW()
       WHERE id = $3 AND status = 'OPEN'
       RETURNING *`,
      [closingCash ?? 0, totalSales, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Session not found or already closed.',
      });
    }

    return res.json({ success: true, data: result.rows[0] });
  }

  // ── Generic field update (e.g. opening_cash correction) ──────────────────
  const result = await db(
    `UPDATE sessions
     SET
       opening_cash = COALESCE($1, opening_cash),
       updated_at   = NOW()
     WHERE id = $2
     RETURNING *`,
    [req.body.openingCash ?? null, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Session not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

module.exports = { getSessions, createSession, getSessionById, updateSession };
