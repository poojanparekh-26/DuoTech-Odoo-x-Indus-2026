// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\middleware\authorizeRole.js

/**
 * Role-based access control middleware factory.
 * Usage: router.get('/admin-only', authenticate, authorizeRole('admin'), handler)
 *
 * @param {...string} roles - Allowed roles.
 * @returns {Function} Express middleware.
 */
function authorizeRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: requires one of [${roles.join(', ')}]`,
      });
    }
    next();
  };
}

module.exports = authorizeRole;
