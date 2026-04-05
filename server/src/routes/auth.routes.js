// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\routes\auth.routes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  signup,
  login,
  logout,
  me,
} = require('../controllers/auth.controller');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, me);

module.exports = router;
