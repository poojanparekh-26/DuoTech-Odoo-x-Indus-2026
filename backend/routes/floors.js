'use strict';

/**
 * routes/floors.js
 *
 * GET  /floors        → list all floors ordered by sort_order then created_at
 * POST /floors        → create a new floor  { name, sortOrder? }
 */

const express = require('express');
const pool    = require('../db');

const router = express.Router();

// ── GET /floors ───────────────────────────────────────────────
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, name, sort_order, created_at
             FROM   floors
             ORDER  BY sort_order ASC, created_at ASC`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('[GET /floors]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch floors.' });
    }
});

// ── POST /floors ──────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { name, sortOrder = 0 } = req.body;

    // ── Validation ────────────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'name is required and must be a non-empty string.',
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
            `INSERT INTO floors (name, sort_order)
             VALUES ($1, $2)
             RETURNING id, name, sort_order, created_at`,
            [name.trim(), sortOrder]
        );
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        // Unique constraint violation (duplicate floor name)
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: `A floor named "${name.trim()}" already exists.`,
            });
        }
        console.error('[POST /floors]', err);
        return res.status(500).json({ success: false, message: 'Failed to create floor.' });
    }
});

module.exports = router;
