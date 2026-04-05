// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\middleware\errorHandler.js

/**
 * Global Express error handler (4-param signature required by Express).
 * Must be mounted LAST in app.js — after all routes.
 *
 * PostgreSQL error codes handled:
 *   23505 → 409 Conflict       (unique constraint violation)
 *   23503 → 400 Bad Request    (foreign key violation)
 *   default → 500 Internal Server Error
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Always log the full error on the server
  console.error(`[Error] ${req.method} ${req.originalUrl}`, err);

  // ─── PostgreSQL-specific error codes ─────────────────────────────────────
  if (err.code === '23505') {
    // Unique violation: extract detail if available
    const detail = err.detail || 'A record with this value already exists.';
    return res.status(409).json({ success: false, error: detail });
  }

  if (err.code === '23503') {
    // Foreign key violation
    const detail = err.detail || 'Referenced record does not exist.';
    return res.status(400).json({ success: false, error: detail });
  }

  if (err.code === '22P02') {
    // Invalid text representation (e.g. bad UUID / int parse)
    return res.status(400).json({ success: false, error: 'Invalid input format.' });
  }

  // ─── HTTP status forwarded from controllers ───────────────────────────────
  const status = err.status || err.statusCode || 500;

  // ─── Default response ─────────────────────────────────────────────────────
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
