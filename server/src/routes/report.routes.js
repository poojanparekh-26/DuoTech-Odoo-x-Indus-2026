// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\report.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getDashboard,
  exportOrders,
  getSessionReport,
} = require('../controllers/report.controller');

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/export',    exportOrders);
router.get('/sessions',  getSessionReport);

module.exports = router;
