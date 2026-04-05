const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const ordersRoute = require('./routes/orders');
const paymentsRoute = require('./routes/payments');
const kitchenRoute = require('./routes/kitchen');
const qrRoute = require('./routes/qr');
const reportsRoute = require('./routes/reports');

// Mount routes
app.use('/api/orders', ordersRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/kitchen', kitchenRoute);
app.use('/api/qr', qrRoute);
app.use('/api/reports', reportsRoute);

// Health test route
app.get('/', (req, res) => {
  res.send('POS API running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
