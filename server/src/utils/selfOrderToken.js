// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\utils\selfOrderToken.js

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a cryptographically random self-order session token.
 * Used to authenticate QR-based customer self-ordering sessions
 * without requiring a full user account.
 *
 * @returns {string} UUID v4 string (e.g. "3d8f2b1a-...")
 */
function generateSelfOrderToken() {
  return uuidv4();
}

module.exports = { generateSelfOrderToken };
