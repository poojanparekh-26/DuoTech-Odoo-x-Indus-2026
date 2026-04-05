// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\middleware\authenticate.js

const { verifyToken } = require('../lib/jwt');

/**
 * Authenticate middleware.
 * Extracts Bearer token from Authorization header OR pos_token cookie.
 * Sets req.user = decoded JWT payload on success.
 */
function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Try Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    // 2. Fall back to cookie
    if (!token && req.cookies && req.cookies.pos_token) {
      token = req.cookies.pos_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

module.exports = authenticate;
