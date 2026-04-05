// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\controllers\report.controller.js

const { db } = require('../../../db/pool');
const asyncHandler = require('../middleware/asyncHandler');

// ─── Build shared date + session + user + product filter clauses ───────────────
//  Returns { conditions: string[], params: any[] }
//  `tableAlias` is the alias for the orders table (default "o")
function buildOrderFilters(query, tableAlias = 'o') {
  const { from, to, sessionId, userId, productId } = query;
  const conditions = [];
  const params = [];

  if (from) {
    params.push(from);
    conditions.push(`${tableAlias}.created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`${tableAlias}.created_at <= $${params.length}`);
  }
  if (sessionId) {
    params.push(sessionId);
    conditions.push(`${tableAlias}.session_id = $${params.length}`);
  }
  if (userId) {
    params.push(userId);
    conditions.push(`${tableAlias}.user_id = $${params.length}`);
  }
  // productId filter applied only where order_items are joined
  return { conditions, params, productId };
}

// ─── GET /api/reports/dashboard ───────────────────────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const { conditions, params, productId } = buildOrderFilters(req.query);

  // Base WHERE fragment (always add status='PAID')
  const paidBase = conditions.length
    ? `AND ${conditions.join(' AND ')}`
    : '';

  // ── 1. Totals ──────────────────────────────────────────────────────────────
  const totalsQuery = db(
    `SELECT
       COUNT(*)::int                       AS total_orders,
       COALESCE(SUM(total),      0)        AS total_sales,
       COALESCE(SUM(tax_amount), 0)        AS total_tax
     FROM orders o
     WHERE o.status = 'PAID' ${paidBase}`,
    params
  );

  // ── 2. Sales by day ────────────────────────────────────────────────────────
  const byDayQuery = db(
    `SELECT
       DATE(o.created_at)  AS date,
       COUNT(*)::int       AS count,
       SUM(o.total)        AS total
     FROM orders o
     WHERE o.status = 'PAID' ${paidBase}
     GROUP BY DATE(o.created_at)
     ORDER BY date ASC`,
    params
  );

  // ── 3. Top products ────────────────────────────────────────────────────────
  // productId filter: narrow to a specific product if requested
  const topProductsParams = [...params];
  let productFilter = '';
  if (productId) {
    topProductsParams.push(productId);
    productFilter = `AND oi.product_id = $${topProductsParams.length}`;
  }
  const topProductsQuery = db(
    `SELECT
       oi.name,
       SUM(oi.quantity)::int AS total_qty,
       SUM(oi.subtotal)      AS revenue
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id
     WHERE o.status = 'PAID' ${paidBase} ${productFilter}
     GROUP BY oi.name
     ORDER BY revenue DESC
     LIMIT 10`,
    topProductsParams
  );

  // ── 4. Payment breakdown ───────────────────────────────────────────────────
  // Join payments → orders to apply the same date/session filters
  let pmConditions = [...conditions].map((c) =>
    // Replace "o." alias with "o." since we join orders as o
    c.replace(/\bo\./g, 'o.')
  );
  const payBreakdownQuery = db(
    `SELECT
       pm.name,
       pm.type,
       COUNT(p.id)::int  AS count,
       SUM(p.amount)     AS total
     FROM payments p
     LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
     LEFT JOIN orders          o  ON o.id  = p.order_id
     WHERE p.status = 'COMPLETED'
       ${params.length ? `AND ${pmConditions.join(' AND ')}` : ''}
     GROUP BY pm.id, pm.name, pm.type
     ORDER BY total DESC`,
    params
  );

  // ── 5. Recent 10 paid orders ───────────────────────────────────────────────
  const recentOrdersQuery = db(
    `SELECT
       o.*,
       t.table_number,
       c.name AS customer_name
     FROM orders o
     LEFT JOIN tables    t ON t.id = o.table_id
     LEFT JOIN customers c ON c.id = o.customer_id
     WHERE o.status = 'PAID' ${paidBase}
     ORDER BY o.created_at DESC
     LIMIT 10`,
    params
  );

  // Run all 5 in parallel
  const [totals, byDay, topProducts, payBreakdown, recentOrders] =
    await Promise.all([
      totalsQuery,
      byDayQuery,
      topProductsQuery,
      payBreakdownQuery,
      recentOrdersQuery,
    ]);

  const totalOrders = totals.rows[0].total_orders;
  const totalSales  = Number(totals.rows[0].total_sales);
  const avgOrderValue =
    totalOrders > 0 ? Math.round((totalSales / totalOrders) * 100) / 100 : 0;

  return res.json({
    success: true,
    data: {
      totals: {
        totalOrders,
        totalSales,
        totalTax:     Number(totals.rows[0].total_tax),
        avgOrderValue,
      },
      salesByDay:       byDay.rows,
      topProducts:      topProducts.rows,
      paymentBreakdown: payBreakdown.rows,
      recentOrders:     recentOrders.rows,
    },
  });
});

// ─── GET /api/reports/export ──────────────────────────────────────────────────
const exportOrders = asyncHandler(async (req, res) => {
  const { conditions, params, productId } = buildOrderFilters(req.query);

  const paidBase = conditions.length
    ? `AND ${conditions.join(' AND ')}`
    : '';

  const ordersResult = await db(
    `SELECT
       o.*,
       t.table_number,
       c.name  AS customer_name,
       u.name  AS user_name
     FROM orders o
     LEFT JOIN tables    t ON t.id = o.table_id
     LEFT JOIN customers c ON c.id = o.customer_id
     LEFT JOIN users     u ON u.id = o.user_id
     WHERE o.status = 'PAID' ${paidBase}
     ORDER BY o.created_at DESC`,
    params
  );

  // Attach items to each order (client will render CSV)
  const orders = await Promise.all(
    ordersResult.rows.map(async (order) => {
      let itemQuery = `
        SELECT oi.*, p.name AS product_name
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
      `;
      const itemParams = [order.id];
      if (productId) {
        itemParams.push(productId);
        itemQuery += ` AND oi.product_id = $2`;
      }
      const itemsResult = await db(itemQuery, itemParams);
      return { ...order, items: itemsResult.rows };
    })
  );

  return res.json({ success: true, data: orders });
});

// ─── GET /api/reports/sessions ────────────────────────────────────────────────
const getSessionReport = asyncHandler(async (_req, res) => {
  const result = await db(
    `SELECT
       s.*,
       u.name    AS user_name,
       pc.name   AS pos_name,
       COUNT(o.id)::int        AS order_count,
       COALESCE(SUM(o.total), 0) AS calculated_sales
     FROM sessions s
     LEFT JOIN users       u  ON u.id  = s.user_id
     LEFT JOIN pos_configs pc ON pc.id = s.pos_id
     LEFT JOIN orders      o  ON o.session_id = s.id AND o.status = 'PAID'
     GROUP BY s.id, u.name, pc.name
     ORDER BY s.created_at DESC`
  );

  return res.json({ success: true, data: result.rows });
});

module.exports = { getDashboard, exportOrders, getSessionReport };
