// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\middleware\asyncHandler.js

/**
 * Wraps an async route handler to automatically forward errors to Express's
 * next() error pipeline, eliminating the need for try/catch in every controller.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }))
 *
 * @param {Function} fn - Async Express route handler.
 * @returns {Function} Wrapped handler.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
