const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * GET /api/payment-methods
 * Returns all active payment methods.
 */
const getPaymentMethods = asyncHandler(async (req, res) => {
  const result = await db(
    'SELECT * FROM payment_methods WHERE is_active = true ORDER BY name ASC'
  );
  return res.json({ success: true, data: result.rows });
});

module.exports = { getPaymentMethods };
