// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\posConfig.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getPosConfigs,
  createPosConfig,
  getPosConfigById,
  updatePosConfig,
} = require('../controllers/posConfig.controller');

router.use(authenticate);

router.get('/',    getPosConfigs);
router.post('/',   createPosConfig);
router.get('/:id', getPosConfigById);
router.put('/:id', updatePosConfig);

module.exports = router;
