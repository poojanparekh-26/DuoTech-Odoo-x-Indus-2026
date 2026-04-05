// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\utils\orderNumber.js

/**
 * Generate a unique, human-readable order number.
 * Format: ORD-<timestamp>-<3-digit random suffix>
 * Example: ORD-1712345678901-423
 *
 * @returns {string}
 */
function generateOrderNumber() {
  const suffix = Math.floor(Math.random() * 900 + 100); // 100–999
  return `ORD-${Date.now()}-${suffix}`;
}

module.exports = { generateOrderNumber };
