// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\table.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getTables,
  createTable,
  getTableById,
  updateTable,
  deleteTable,
} = require('../controllers/table.controller');

router.use(authenticate);

router.get('/',    getTables);
router.post('/',   createTable);
router.get('/:id', getTableById);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

module.exports = router;
