// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\lib\jwt.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'odoo_pos_secret_fallback';

/**
 * Sign a JWT token valid for 7 days.
 * @param {object} payload - Data to embed in the token.
 * @returns {string} Signed JWT string.
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 * @param {string} token
 * @returns {object} Decoded payload.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
