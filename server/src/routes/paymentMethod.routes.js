const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getPaymentMethods } = require('../controllers/paymentMethod.controller');

router.use(authenticate);
router.get('/', getPaymentMethods);

module.exports = router;
