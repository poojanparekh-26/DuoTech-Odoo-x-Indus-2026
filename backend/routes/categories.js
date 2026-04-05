'use strict';

/**
 * routes/categories.js
 *
 * GET  /categories   → list all active categories
 * POST /categories   → { name, color? }  → create category
 */

const express = require('express');
const pool    = require('../db');

const router = express.Router();

// Loose hex / named-color guard — prevents junk from hitting the DB.
// Accepts: #abc, #aabbcc, #aabbccdd, or bare CSS keyword (max 50 chars)
const COLOR_RE = /^(#([0-9a-fA-F]{3,8})|[a-zA-Z][a-zA-Z0-9-]{1,49})$/;

// ── GET /categories ───────────────────────────────────────────
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT   id,
                      name,
                      color,
                      sort_order,
                      created_at
             FROM     categories
             WHERE    is_active = TRUE
             ORDER BY sort_order ASC, name ASC`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('[GET /categories]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
});

// ── POST /categories ──────────────────────────────────────────
router.post('/', async (req, res) => {
    const { name, color = '#6366f1', sortOrder = 0 } = req.body;

    // ── Validation ─────────────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'name is required and must be a non-empty string.',
        });
    }

    if (typeof color !== 'string' || !COLOR_RE.test(color.trim())) {
        return res.status(400).json({
            success: false,
            message: 'color must be a valid hex code (e.g. #f43f5e) or CSS color keyword.',
        });
    }

    if (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder)) {
        return res.status(400).json({
            success: false,
            message: 'sortOrder must be an integer.',
        });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO categories (name, color, sort_order)
             VALUES ($1, $2, $3)
             RETURNING id, name, color, sort_order, created_at`,
            [name.trim(), color.trim(), sortOrder]
        );
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: `A category named "${name.trim()}" already exists.`,
            });
        }
        console.error('[POST /categories]', err);
        return res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
});

module.exports = router;
