// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\order.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/order.controller');

router.use(authenticate);

router.get('/',    getOrders);
router.post('/',   createOrder);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
