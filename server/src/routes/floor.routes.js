// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\floor.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getFloors,
  createFloor,
  getFloorById,
  updateFloor,
  deleteFloor,
} = require('../controllers/floor.controller');

router.use(authenticate);

router.get('/',    getFloors);
router.post('/',   createFloor);
router.get('/:id', getFloorById);
router.put('/:id', updateFloor);
router.delete('/:id', deleteFloor);

module.exports = router;
