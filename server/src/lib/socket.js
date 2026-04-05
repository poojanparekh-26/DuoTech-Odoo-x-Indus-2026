// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\lib\socket.js

const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.io on the given HTTP server.
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // ─── Room joins ──────────────────────────────────────────────────────────
    socket.on('join:kitchen', () => {
      socket.join('kitchen');
      console.log(`[Socket] ${socket.id} joined room: kitchen`);
    });

    socket.on('join:customer-display', () => {
      socket.join('customer-display');
      console.log(`[Socket] ${socket.id} joined room: customer-display`);
    });

    socket.on('join:pos', ({ sessionId }) => {
      if (!sessionId) return;
      const room = `pos:${sessionId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });

    // ─── Kitchen order status update ─────────────────────────────────────────
    socket.on('kitchen:update-status', (data) => {
      io.emit('order:status-updated', data);
      console.log(`[Socket] kitchen:update-status → broadcast:`, data);
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Get the initialized Socket.io instance.
 * Throws if called before initSocket().
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket(server) first.');
  }
  return io;
}

module.exports = { initSocket, getIO };
