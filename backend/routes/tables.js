'use strict';

/**
 * routes/tables.js
 *
 * GET   /tables?floorId=X   → list tables, optionally filtered by floor
 * POST  /tables              → create a new table  { floorId, number, seats, capacity? }
 * PATCH /tables/:id/status   → update table status  { status: 'available' | 'occupied' }
 */

const express = require('express');
const pool    = require('../db');

const router = express.Router();

// Allowed status values — single source of truth
const VALID_STATUSES = ['available', 'occupied'];

// ── GET /tables ───────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { floorId } = req.query;

    // Optional floorId filter — must be a positive integer when supplied
    if (floorId !== undefined) {
        const parsed = parseInt(floorId, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return res.status(400).json({
                success: false,
                message: 'floorId must be a positive integer.',
            });
        }

        try {
            const { rows } = await pool.query(
                `SELECT  t.id,
                         t.floor_id,
                         f.name   AS floor_name,
                         t.table_no,
                         t.capacity,
                         t.status,
                         t.is_active,
                         t.created_at
                 FROM    tables  t
                 JOIN    floors  f ON f.id = t.floor_id
                 WHERE   t.floor_id = $1
                 ORDER   BY t.table_no ASC`,
                [parsed]
            );
            return res.status(200).json({ success: true, data: rows });
        } catch (err) {
            console.error('[GET /tables?floorId]', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch tables.' });
        }
    }

    // No filter — return all tables
    try {
        const { rows } = await pool.query(
            `SELECT  t.id,
                     t.floor_id,
                     f.name   AS floor_name,
                     t.table_no,
                     t.capacity,
                     t.status,
                     t.is_active,
                     t.created_at
             FROM    tables  t
             JOIN    floors  f ON f.id = t.floor_id
             ORDER   BY f.sort_order ASC, t.table_no ASC`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('[GET /tables]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch tables.' });
    }
});

// ── POST /tables ──────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { floorId, number, seats } = req.body;

    // ── Validation ────────────────────────────────────────────
    if (!floorId || !Number.isInteger(Number(floorId)) || Number(floorId) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'floorId is required and must be a positive integer.',
        });
    }

    if (!number || typeof number !== 'string' || number.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'number (table number/label) is required and must be a non-empty string.',
        });
    }

    const capacity = seats !== undefined ? Number(seats) : null;
    if (capacity !== null && (!Number.isInteger(capacity) || capacity <= 0)) {
        return res.status(400).json({
            success: false,
            message: 'seats must be a positive integer.',
        });
    }

    try {
        // Verify the floor exists before inserting
        const { rows: floorCheck } = await pool.query(
            'SELECT id FROM floors WHERE id = $1',
            [Number(floorId)]
        );
        if (floorCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: `Floor with id ${floorId} does not exist.`,
            });
        }

        const { rows } = await pool.query(
            `INSERT INTO tables (floor_id, table_no, capacity)
             VALUES ($1, $2, $3)
             RETURNING id, floor_id, table_no, capacity, status, is_active, created_at`,
            [Number(floorId), number.trim(), capacity ?? 4]
        );
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        // Unique constraint: same table_no on the same floor
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: `Table "${number.trim()}" already exists on floor ${floorId}.`,
            });
        }
        // FK violation: floor_id not found (belt-and-suspenders)
        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: `Floor with id ${floorId} does not exist.`,
            });
        }
        console.error('[POST /tables]', err);
        return res.status(500).json({ success: false, message: 'Failed to create table.' });
    }
});

// ── PATCH /tables/:id/status ──────────────────────────────────
router.patch('/:id/status', async (req, res) => {
    const tableId = parseInt(req.params.id, 10);
    const { status } = req.body;

    // ── Validate :id ──────────────────────────────────────────
    if (isNaN(tableId) || tableId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Table id must be a positive integer.',
        });
    }

    // ── Validate status ───────────────────────────────────────
    if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `status must be one of: ${VALID_STATUSES.join(', ')}.`,
        });
    }

    try {
        const { rows } = await pool.query(
            `UPDATE tables
             SET    status = $1
             WHERE  id     = $2
             RETURNING id, floor_id, table_no, capacity, status, is_active, created_at`,
            [status, tableId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Table with id ${tableId} not found.`,
            });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('[PATCH /tables/:id/status]', err);
        return res.status(500).json({ success: false, message: 'Failed to update table status.' });
    }
});

module.exports = router;
