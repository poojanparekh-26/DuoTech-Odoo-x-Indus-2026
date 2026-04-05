// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\selfOrder.routes.js

const express = require('express');
const router = express.Router();
const {
  generateToken,
  getOrderByToken,
  addItemsByToken,
} = require('../controllers/selfOrder.controller');

// All self-order routes are public — customers scan QR, no login required

router.post('/token',          generateToken);
router.get('/:token',          getOrderByToken);
router.post('/:token/order',   addItemsByToken);

module.exports = router;
