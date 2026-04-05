// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\product.controller.js

const { db, pool } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── Helper: fetch variants for a product id ──────────────────────────────────
async function fetchVariants(productId) {
  const result = await db(
    'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id',
    [productId]
  );
  return result.rows;
}

// ─── GET /api/products ────────────────────────────────────────────────────────
const getProducts = asyncHandler(async (req, res) => {
  const { categoryId, isActive } = req.query;

  let query = `
    SELECT
      p.*,
      c.name  AS category_name,
      c.color AS category_color
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE 1=1
  `;
  const params = [];

  if (categoryId) {
    params.push(categoryId);
    query += ` AND p.category_id = $${params.length}`;
  }

  if (isActive !== undefined) {
    params.push(isActive === 'true' || isActive === '1');
    query += ` AND p.is_active = $${params.length}`;
  }

  query += ' ORDER BY p.created_at DESC';

  const result = await db(query, params);

  // Attach variants to each product
  const products = await Promise.all(
    result.rows.map(async (product) => ({
      ...product,
      variants: await fetchVariants(product.id),
    }))
  );

  return res.json({ success: true, data: products });
});

// ─── POST /api/products ───────────────────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    tax,
    uom,
    isActive,
    categoryId,
    variants = [],
  } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      success: false,
      error: 'name and price are required.',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert product
    const productResult = await client.query(
      `INSERT INTO products (id, name, description, price, tax, uom, is_active, category_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name.trim(),
        description || null,
        price,
        tax ?? 0,
        uom || 'Unit',
        isActive !== undefined ? isActive : true,
        categoryId || null,
      ]
    );

    const product = productResult.rows[0];

    // Insert variants
    const insertedVariants = [];
    for (const v of variants) {
      const vResult = await client.query(
        `INSERT INTO product_variants (id, product_id, attribute, value, unit, extra_price)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         RETURNING *`,
        [
          product.id,
          v.attribute || null,
          v.value || null,
          v.unit || null,
          v.extraPrice ?? 0,
        ]
      );
      insertedVariants.push(vResult.rows[0]);
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: { ...product, variants: insertedVariants },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err; // Let errorHandler handle it
  } finally {
    client.release();
  }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
  const result = await db(
    `SELECT
       p.*,
       c.name  AS category_name,
       c.color AS category_color
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  const product = result.rows[0];
  const variants = await fetchVariants(product.id);

  return res.json({ success: true, data: { ...product, variants } });
});

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    tax,
    uom,
    isActive,
    categoryId,
    variants = [],
  } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      success: false,
      error: 'name and price are required.',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update product
    const productResult = await client.query(
      `UPDATE products
       SET
         name        = $1,
         description = $2,
         price       = $3,
         tax         = $4,
         uom         = $5,
         is_active   = $6,
         category_id = $7,
         updated_at  = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        name.trim(),
        description || null,
        price,
        tax ?? 0,
        uom || 'Unit',
        isActive !== undefined ? isActive : true,
        categoryId || null,
        id,
      ]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const product = productResult.rows[0];

    // Replace all variants: delete existing, re-insert supplied
    await client.query(
      'DELETE FROM product_variants WHERE product_id = $1',
      [id]
    );

    const insertedVariants = [];
    for (const v of variants) {
      const vResult = await client.query(
        `INSERT INTO product_variants (id, product_id, attribute, value, unit, extra_price)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         RETURNING *`,
        [
          product.id,
          v.attribute || null,
          v.value || null,
          v.unit || null,
          v.extraPrice ?? 0,
        ]
      );
      insertedVariants.push(vResult.rows[0]);
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      data: { ...product, variants: insertedVariants },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ─── DELETE /api/products/:id (soft delete) ───────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db(
    `UPDATE products
     SET is_active = false, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, is_active`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  return res.json({ success: true, data: result.rows[0] });
});

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
