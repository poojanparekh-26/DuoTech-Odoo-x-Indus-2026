// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\customer.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
} = require('../controllers/customer.controller');

router.use(authenticate);

router.get('/',    getCustomers);
router.post('/',   createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

module.exports = router;
