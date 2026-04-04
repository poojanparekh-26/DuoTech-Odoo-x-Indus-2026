'use strict';

/**
 * routes/variants.js
 *
 * GET  /variants?productId=X  → list variants for a product
 * POST /variants              → { productId, attribute, value, extraPrice? } → create
 *
 * Schema columns:
 *   product_variants(id, product_id, attribute, value, price_delta, is_available, created_at)
 *
 * API naming:
 *   extraPrice (request body)  ↔  price_delta (DB column)
 */

const express = require('express');
const pool    = require('../db');

const router = express.Router();

// ── GET /variants ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { productId } = req.query;

    if (!productId) {
        return res.status(400).json({
            success: false,
            message: 'productId query parameter is required.',
        });
    }

    const parsed = parseInt(productId, 10);
    if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({
            success: false,
            message: 'productId must be a positive integer.',
        });
    }

    try {
        const { rows } = await pool.query(
            `SELECT  id,
                     product_id,
                     attribute,
                     value,
                     price_delta   AS extra_price,
                     is_available,
                     created_at
             FROM    product_variants
             WHERE   product_id = $1
             ORDER   BY attribute ASC, value ASC`,
            [parsed]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('[GET /variants?productId]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch variants.' });
    }
});

// ── POST /variants ────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { productId, attribute, value, extraPrice = 0 } = req.body;

    // ── Validation ────────────────────────────────────────────
    const parsedProductId = parseInt(productId, 10);
    if (!productId || isNaN(parsedProductId) || parsedProductId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'productId is required and must be a positive integer.',
        });
    }

    if (!attribute || typeof attribute !== 'string' || attribute.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'attribute is required and must be a non-empty string (e.g. "Size", "Spice Level").',
        });
    }

    if (!value || typeof value !== 'string' || value.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'value is required and must be a non-empty string (e.g. "Large", "Extra Hot").',
        });
    }

    const priceDelta = parseFloat(extraPrice);
    if (isNaN(priceDelta) || priceDelta < 0) {
        return res.status(400).json({
            success: false,
            message: 'extraPrice must be a non-negative number.',
        });
    }

    try {
        // Verify the product exists
        const { rows: productCheck } = await pool.query(
            'SELECT id FROM products WHERE id = $1 AND is_active = TRUE',
            [parsedProductId]
        );
        if (productCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: `Product with id ${parsedProductId} does not exist or is inactive.`,
            });
        }

        const { rows } = await pool.query(
            `INSERT INTO product_variants (product_id, attribute, value, price_delta)
             VALUES ($1, $2, $3, $4)
             RETURNING id,
                       product_id,
                       attribute,
                       value,
                       price_delta  AS extra_price,
                       is_available,
                       created_at`,
            [parsedProductId, attribute.trim(), value.trim(), priceDelta]
        );
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        // Unique constraint: same (product_id, attribute, value) already exists
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: `Variant "${attribute.trim()}: ${value.trim()}" already exists for product ${parsedProductId}.`,
            });
        }
        // FK violation (belt-and-suspenders)
        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: `Product with id ${parsedProductId} does not exist.`,
            });
        }
        console.error('[POST /variants]', err);
        return res.status(500).json({ success: false, message: 'Failed to create variant.' });
    }
});

module.exports = router;
