// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\kitchen.routes.js

const express = require('express');
const router = express.Router();
const {
  getKitchenOrders,
  updateKitchenStatus,
  toggleItemPrepared,
} = require('../controllers/kitchen.controller');

// Kitchen display screen is public — no authenticate middleware

router.get('/orders',                          getKitchenOrders);
router.put('/orders/:id/status',               updateKitchenStatus);
router.put('/orders/:id/items/:itemId',        toggleItemPrepared);

module.exports = router;
