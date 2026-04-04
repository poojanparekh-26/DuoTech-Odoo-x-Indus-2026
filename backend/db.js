const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "odoo_pos",
  password: "Postpap@04",
  port: 5432,
});

module.exports = pool;