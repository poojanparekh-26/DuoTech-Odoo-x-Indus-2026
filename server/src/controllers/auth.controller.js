// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\auth.controller.js

const bcrypt = require('bcryptjs');
const { db } = require('../../../db/pool');
const { signToken } = require('../lib/jwt');
const asyncHandler = require('../middleware/asyncHandler');

// ─── Cookie helper ────────────────────────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'name, email, and password are required.',
    });
  }

  // Check email not already taken
  const existing = await db(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email already exists.',
    });
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Insert user (role defaults to ADMIN per schema)
  const result = await db(
    `INSERT INTO users (id, name, email, password_hash, role)
     VALUES (gen_random_uuid(), $1, $2, $3, 'ADMIN')
     RETURNING id, name, email, role, created_at`,
    [name.trim(), email.toLowerCase().trim(), password_hash]
  );

  const user = result.rows[0];

  // Sign JWT
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  // Set HttpOnly cookie
  res.cookie('pos_token', token, COOKIE_OPTIONS);

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'email and password are required.',
    });
  }

  // Fetch user
  const result = await db(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password.',
    });
  }

  const user = result.rows[0];

  // Compare password
  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password.',
    });
  }

  // Sign JWT
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  // Set HttpOnly cookie
  res.cookie('pos_token', token, COOKIE_OPTIONS);

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('pos_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.json({
    success: true,
    data: { message: 'Logged out successfully.' },
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = asyncHandler(async (req, res) => {
  // req.user is set by authenticate middleware (decoded JWT payload)
  return res.json({
    success: true,
    data: req.user,
  });
});

module.exports = { signup, login, logout, me };
