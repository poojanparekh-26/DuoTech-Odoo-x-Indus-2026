// C:/Users/pruthilpatel/Desktop/odoo hacathon/db/pool.js
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/odoo_pos'
});

module.exports = {
  pool,
  db: (text, params) => pool.query(text, params)
};
