// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\session.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getSessions,
  createSession,
  getSessionById,
  updateSession,
} = require('../controllers/session.controller');

router.use(authenticate);

router.get('/',    getSessions);
router.post('/',   createSession);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);

module.exports = router;
