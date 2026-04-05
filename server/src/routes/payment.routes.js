// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\payment.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getPayments,
  createPayment,
  updatePayment,
  generateUpiQr,
} = require('../controllers/payment.controller');

router.use(authenticate);

// UPI QR must be before /:id to avoid route collision
router.post('/upi-qr', generateUpiQr);

router.get('/',    getPayments);
router.post('/',   createPayment);
router.put('/:id', updatePayment);

module.exports = router;
