// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\category.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── GET /api/categories ──────────────────────────────────────────────────────
const getCategories = asyncHandler(async (_req, res) => {
  const result = await db(
    `SELECT
       c.*,
       COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  );

  return res.json({ success: true, data: result.rows });
});

// ─── POST /api/categories ─────────────────────────────────────────────────────
const createCategory = asyncHandler(async (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }

  const result = await db(
    `INSERT INTO categories (id, name, color)
     VALUES (gen_random_uuid(), $1, $2)
     RETURNING *`,
    [name.trim(), color || '#F59E0B']
  );

  return res.status(201).json({ success: true, data: result.rows[0] });
});

// ─── GET /api/categories/:id ──────────────────────────────────────────────────
const getCategoryById = asyncHandler(async (req, res) => {
  const result = await db(
    `SELECT
       c.*,
       COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Category not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

// ─── PUT /api/categories/:id ──────────────────────────────────────────────────
const updateCategory = asyncHandler(async (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required.' });
  }

  const result = await db(
    `UPDATE categories
     SET name = $1, color = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [name.trim(), color || '#F59E0B', req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Category not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Guard: reject if active products exist in this category
  const countResult = await db(
    `SELECT COUNT(*)::int AS count
     FROM products
     WHERE category_id = $1 AND is_active = true`,
    [id]
  );

  if (countResult.rows[0].count > 0) {
    return res.status(400).json({
      success: false,
      error: 'Category has active products. Deactivate or reassign them first.',
    });
  }

  const result = await db(
    'DELETE FROM categories WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Category not found.' });
  }

  return res.json({ success: true, data: { id } });
});

module.exports = {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
