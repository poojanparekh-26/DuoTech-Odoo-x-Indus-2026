// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\table.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── GET /api/tables ──────────────────────────────────────────────────────────
const getTables = asyncHandler(async (req, res) => {
  const { floorId } = req.query;

  let query = `
    SELECT
      t.*,
      f.name AS floor_name
    FROM tables t
    LEFT JOIN floors f ON f.id = t.floor_id
    WHERE 1=1
  `;
  const params = [];

  if (floorId) {
    params.push(floorId);
    query += ` AND t.floor_id = $${params.length}`;
  }

  query += ' ORDER BY t.table_number ASC';

  const result = await db(query, params);
  return res.json({ success: true, data: result.rows });
});

// ─── POST /api/tables ─────────────────────────────────────────────────────────
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, seats, floorId, positionX, positionY } = req.body;

  if (!tableNumber || !floorId) {
    return res.status(400).json({
      success: false,
      error: 'tableNumber and floorId are required.',
    });
  }

  const result = await db(
    `INSERT INTO tables (id, table_number, seats, floor_id, position_x, position_y)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING *`,
    [
      tableNumber,
      seats      ?? 4,
      floorId,
      positionX  ?? 0,
      positionY  ?? 0,
    ]
  );

  return res.status(201).json({ success: true, data: result.rows[0] });
});

// ─── GET /api/tables/:id ──────────────────────────────────────────────────────
const getTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tableResult = await db(
    `SELECT t.*, f.name AS floor_name
     FROM tables t
     LEFT JOIN floors f ON f.id = t.floor_id
     WHERE t.id = $1`,
    [id]
  );

  if (tableResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Table not found.' });
  }

  // Check for an active DRAFT order on this table
  const orderResult = await db(
    `SELECT * FROM orders
     WHERE table_id = $1 AND status = 'DRAFT'
     ORDER BY created_at DESC
     LIMIT 1`,
    [id]
  );

  return res.json({
    success: true,
    data: {
      ...tableResult.rows[0],
      activeOrder: orderResult.rows[0] || null,
    },
  });
});

// ─── PUT /api/tables/:id ──────────────────────────────────────────────────────
const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tableNumber, seats, isActive, positionX, positionY } = req.body;

  const result = await db(
    `UPDATE tables
     SET
       table_number = COALESCE($1, table_number),
       seats        = COALESCE($2, seats),
       is_active    = COALESCE($3, is_active),
       position_x   = COALESCE($4, position_x),
       position_y   = COALESCE($5, position_y),
       updated_at   = NOW()
     WHERE id = $6
     RETURNING *`,
    [
      tableNumber ?? null,
      seats       ?? null,
      isActive    !== undefined ? isActive : null,
      positionX   ?? null,
      positionY   ?? null,
      id,
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Table not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

// ─── DELETE /api/tables/:id (soft delete) ────────────────────────────────────
const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db(
    `UPDATE tables
     SET is_active = false, updated_at = NOW()
     WHERE id = $1
     RETURNING id, table_number, is_active`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Table not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

module.exports = { getTables, createTable, getTableById, updateTable, deleteTable };
