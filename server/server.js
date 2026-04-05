// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\server.js

const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { initSocket } = require('./src/lib/socket');

const PORT = process.env.PORT || 5000;

// ─── Create HTTP server ───────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Attach Socket.io ─────────────────────────────────────────────────────────
initSocket(server);

// ─── Start listening ──────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('─────────────────────────────────────────────');
  console.log(`  🚀 Odoo POS Cafe Server`);
  console.log(`  ► Mode    : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ► Port    : ${PORT}`);
  console.log(`  ► API     : http://localhost:${PORT}/api`);
  console.log(`  ► Health  : http://localhost:${PORT}/api/health`);
  console.log('─────────────────────────────────────────────');
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
