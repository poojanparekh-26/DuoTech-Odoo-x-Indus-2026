// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\floor.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── GET /api/floors ──────────────────────────────────────────────────────────
const getFloors = asyncHandler(async (req, res) => {
  const { posId } = req.query;

  let query = `
    SELECT
      f.*,
      COUNT(t.id)::int AS table_count,
      COALESCE(
        (SELECT json_agg(tbl.* ORDER BY tbl.table_number)
         FROM tables tbl
         WHERE tbl.floor_id = f.id AND tbl.is_active = true),
        '[]'
      ) AS tables
    FROM floors f
    LEFT JOIN tables t ON t.floor_id = f.id
    WHERE 1=1
  `;
  const params = [];

  if (posId) {
    params.push(posId);
    query += ` AND f.pos_id = $${params.length}`;
  }

  query += ' GROUP BY f.id ORDER BY f.created_at ASC';

  const result = await db(query, params);
  return res.json({ success: true, data: result.rows });
});

// ─── POST /api/floors ─────────────────────────────────────────────────────────
const createFloor = asyncHandler(async (req, res) => {
  const { name, posId } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }
  if (!posId) {
    return res.status(400).json({ success: false, error: 'posId is required.' });
  }

  const result = await db(
    `INSERT INTO floors (id, name, pos_id)
     VALUES (gen_random_uuid(), $1, $2)
     RETURNING *`,
    [name.trim(), posId]
  );

  return res.status(201).json({ success: true, data: result.rows[0] });
});

// ─── GET /api/floors/:id ──────────────────────────────────────────────────────
const getFloorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Floor detail
  const floorResult = await db(
    'SELECT * FROM floors WHERE id = $1',
    [id]
  );

  if (floorResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Floor not found.' });
  }

  // All tables on this floor
  const tablesResult = await db(
    `SELECT * FROM tables WHERE floor_id = $1 ORDER BY table_number ASC`,
    [id]
  );

  return res.json({
    success: true,
    data: { ...floorResult.rows[0], tables: tablesResult.rows },
  });
});

// ─── PUT /api/floors/:id ──────────────────────────────────────────────────────
const updateFloor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }

  const result = await db(
    `UPDATE floors
     SET name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [name.trim(), id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Floor not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

// ─── DELETE /api/floors/:id ───────────────────────────────────────────────────
const deleteFloor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Guard: no active tables
  const countResult = await db(
    `SELECT COUNT(*)::int AS count FROM tables WHERE floor_id = $1 AND is_active = true`,
    [id]
  );

  if (countResult.rows[0].count > 0) {
    return res.status(400).json({
      success: false,
      error: 'Floor has active tables. Deactivate or remove them first.',
    });
  }

  const result = await db(
    'DELETE FROM floors WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Floor not found.' });
  }

  return res.json({ success: true, data: { id } });
});

module.exports = { getFloors, createFloor, getFloorById, updateFloor, deleteFloor };
