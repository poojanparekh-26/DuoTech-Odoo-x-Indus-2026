/**
 * routes/auth.js
 * Restaurant POS — Authentication Routes
 *
 * POST /auth/signup  → register a new user
 * POST /auth/login   → authenticate, return JWT + user
 *
 * Dependencies: bcrypt, jsonwebtoken, pg (pool injected via app.locals)
 */

'use strict';

const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

const router = express.Router();

// ── Constants ─────────────────────────────────────────────────
const SALT_ROUNDS   = 12;
const TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

// ── Helpers ───────────────────────────────────────────────────
/**
 * Sign a JWT for the given user row.
 * @param {{ id: number, email: string, role: string }} user
 * @returns {string} signed token
 */
function signToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES, algorithm: 'HS256' }
    );
}

/**
 * Strip sensitive fields and return a safe user object.
 * @param {object} row - DB row
 */
function safeUser(row) {
    return {
        id:    row.id,
        name:  row.name,
        email: row.email,
        role:  row.role,
    };
}

/**
 * Basic field validation helper.
 * Returns an error string or null.
 */
function validateSignupBody({ name, email, password, role }) {
    if (!name  || typeof name  !== 'string' || name.trim().length < 2)
        return 'name must be at least 2 characters.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return 'A valid email is required.';
    if (!password || password.length < 8)
        return 'password must be at least 8 characters.';
    const allowed = ['admin', 'cashier', 'waiter', 'kitchen'];
    if (role && !allowed.includes(role))
        return `role must be one of: ${allowed.join(', ')}.`;
    return null;
}

// ── POST /auth/signup ─────────────────────────────────────────
router.post('/signup', async (req, res) => {
    const { name, email, password, role = 'cashier' } = req.body;

    const validationError = validateSignupBody({ name, email, password, role });
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const pool = req.app.locals.pool;

    try {
        // Duplicate email check
        const { rows: existing } = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role`,
            [name.trim(), email.toLowerCase().trim(), passwordHash, role]
        );

        const user  = rows[0];
        const token = signToken(user);

        return res.status(201).json({
            success: true,
            token,
            user: safeUser(user),
        });
    } catch (err) {
        console.error('[auth/signup]', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// ── POST /auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'email and password are required.',
        });
    }

    const pool = req.app.locals.pool;

    try {
        const { rows } = await pool.query(
            `SELECT id, name, email, password_hash, role, is_active
             FROM users
             WHERE email = $1`,
            [email.toLowerCase().trim()]
        );

        if (rows.length === 0) {
            // Deliberate vague message to prevent user-enumeration
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const user = rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is disabled. Contact your administrator.',
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const token = signToken(user);

        return res.status(200).json({
            success: true,
            token,
            user: safeUser(user),
        });
    } catch (err) {
        console.error('[auth/login]', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
