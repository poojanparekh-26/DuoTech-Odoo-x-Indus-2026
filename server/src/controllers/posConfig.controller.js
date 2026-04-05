// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\posConfig.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── GET /api/pos-config ──────────────────────────────────────────────────────
const getPosConfigs = asyncHandler(async (_req, res) => {
  const result = await db(
    `SELECT
       pc.*,
       COUNT(f.id)::int AS floor_count
     FROM pos_configs pc
     LEFT JOIN floors f ON f.pos_id = pc.id
     GROUP BY pc.id
     ORDER BY pc.created_at DESC`
  );

  return res.json({ success: true, data: result.rows });
});

// ─── POST /api/pos-config ─────────────────────────────────────────────────────
const createPosConfig = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }

  const result = await db(
    `INSERT INTO pos_configs (id, name)
     VALUES (gen_random_uuid(), $1)
     RETURNING *`,
    [name.trim()]
  );

  return res.status(201).json({ success: true, data: result.rows[0] });
});

// ─── GET /api/pos-config/:id ──────────────────────────────────────────────────
const getPosConfigById = asyncHandler(async (req, res) => {
  const result = await db(
    `SELECT
       pc.*,
       COALESCE(
         array_agg(
           json_build_object('id', f.id, 'name', f.name)
           ORDER BY f.created_at
         ) FILTER (WHERE f.id IS NOT NULL),
         '{}'
       ) AS floors
     FROM pos_configs pc
     LEFT JOIN floors f ON f.pos_id = pc.id
     WHERE pc.id = $1
     GROUP BY pc.id`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'POS config not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

// ─── PUT /api/pos-config/:id ──────────────────────────────────────────────────
const updatePosConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    cashEnabled,
    digitalEnabled,
    upiEnabled,
    upiId,
    floorEnabled,
  } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }

  const result = await db(
    `UPDATE pos_configs
     SET
       name             = $1,
       cash_enabled     = $2,
       digital_enabled  = $3,
       upi_enabled      = $4,
       upi_id           = $5,
       floor_enabled    = $6,
       updated_at       = NOW()
     WHERE id = $7
     RETURNING *`,
    [
      name.trim(),
      cashEnabled    !== undefined ? cashEnabled    : true,
      digitalEnabled !== undefined ? digitalEnabled : true,
      upiEnabled     !== undefined ? upiEnabled     : false,
      upiId || null,
      floorEnabled   !== undefined ? floorEnabled   : true,
      id,
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'POS config not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

module.exports = { getPosConfigs, createPosConfig, getPosConfigById, updatePosConfig };
