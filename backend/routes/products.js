'use strict';

/**
 * routes/products.js
 *
 * GET  /products              → list all active products (JOIN categories)
 * GET  /products?categoryId=X → filter by category
 * POST /products              → { name, description?, price, categoryId } → create
 */

const express = require('express');
const pool    = require('../db');

const router = express.Router();

// ── Shared SELECT ─────────────────────────────────────────────
// Returns the same shape whether filtered or not.
const BASE_SELECT = `
    SELECT  p.id,
            p.name,
            p.description,
            p.base_price          AS price,
            p.is_active,
            p.is_available,
            p.image_url,
            p.category_id,
            c.name                AS category_name,
            c.color               AS category_color,
            p.created_at
    FROM    products   p
    JOIN    categories c ON c.id = p.category_id
    WHERE   p.is_active = TRUE
`;

// ── GET /products ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { categoryId } = req.query;

    if (categoryId !== undefined) {
        const parsed = parseInt(categoryId, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return res.status(400).json({
                success: false,
                message: 'categoryId must be a positive integer.',
            });
        }

        try {
            const { rows } = await pool.query(
                BASE_SELECT + ' AND p.category_id = $1 ORDER BY p.name ASC',
                [parsed]
            );
            return res.status(200).json({ success: true, data: rows });
        } catch (err) {
            console.error('[GET /products?categoryId]', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
        }
    }

    // No filter
    try {
        const { rows } = await pool.query(
            BASE_SELECT + ' ORDER BY c.sort_order ASC, p.name ASC'
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('[GET /products]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
});

// ── POST /products ────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { name, description = null, price, categoryId } = req.body;

    // ── Validation ────────────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'name is required and must be a non-empty string.',
        });
    }

    const parsedPrice = parseFloat(price);
    if (price === undefined || isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
            success: false,
            message: 'price is required and must be a non-negative number.',
        });
    }

    const parsedCategoryId = parseInt(categoryId, 10);
    if (!categoryId || isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'categoryId is required and must be a positive integer.',
        });
    }

    if (description !== null && typeof description !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'description must be a string when provided.',
        });
    }

    try {
        // Verify category exists
        const { rows: catCheck } = await pool.query(
            'SELECT id FROM categories WHERE id = $1 AND is_active = TRUE',
            [parsedCategoryId]
        );
        if (catCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: `Category with id ${parsedCategoryId} does not exist or is inactive.`,
            });
        }

        const { rows } = await pool.query(
            `INSERT INTO products (name, description, base_price, category_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id,
                       name,
                       description,
                       base_price  AS price,
                       category_id,
                       is_active,
                       is_available,
                       created_at`,
            [name.trim(), description?.trim() ?? null, parsedPrice, parsedCategoryId]
        );
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        // FK violation (belt-and-suspenders)
        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: `Category with id ${parsedCategoryId} does not exist.`,
            });
        }
        console.error('[POST /products]', err);
        return res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
});

module.exports = router;
