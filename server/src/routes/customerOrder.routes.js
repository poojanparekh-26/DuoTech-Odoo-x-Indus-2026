// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\customerOrder.routes.js

const express = require('express');
const router = express.Router();
const { createCustomerOrder } = require('../controllers/customerOrder.controller');

// Public routes - no authentication required
router.post('/', createCustomerOrder);

module.exports = router;
