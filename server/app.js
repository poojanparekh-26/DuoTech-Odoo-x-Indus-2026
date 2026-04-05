// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const orderRoutes = require('./src/routes/order.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const floorRoutes = require('./src/routes/floor.routes');
const tableRoutes = require('./src/routes/table.routes');
const sessionRoutes = require('./src/routes/session.routes');
const customerRoutes = require('./src/routes/customer.routes');
const customerOrderRoutes = require('./src/routes/customerOrder.routes');
const posConfigRoutes = require('./src/routes/posConfig.routes');
const reportRoutes = require('./src/routes/report.routes');
const kitchenRoutes = require('./src/routes/kitchen.routes');
const selfOrderRoutes = require('./src/routes/selfOrder.routes');
const paymentMethodRoutes = require('./src/routes/paymentMethod.routes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/products',       productRoutes);
app.use('/api/categories',     categoryRoutes);
app.use('/api/orders',         orderRoutes);
app.use('/api/payments',       paymentRoutes);
app.use('/api/floors',         floorRoutes);
app.use('/api/tables',         tableRoutes);
app.use('/api/sessions',       sessionRoutes);
app.use('/api/customers',      customerRoutes);
app.use('/api/customer-orders', customerOrderRoutes);
app.use('/api/pos-config',     posConfigRoutes);
app.use('/api/reports',        reportRoutes);
app.use('/api/kitchen',        kitchenRoutes);
app.use('/api/self-order',     selfOrderRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Odoo POS Cafe API is running' });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
