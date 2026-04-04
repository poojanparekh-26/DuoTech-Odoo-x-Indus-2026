'use strict';

/**
 * db.js — Shared PostgreSQL connection pool
 *
 * Usage in any route file:
 *   const pool = require('../db');
 *
 * Reads DATABASE_URL (or individual PG* vars) from the environment.
 * Keeps a single pool alive for the lifetime of the process.
 */

const { Pool } = require('pg');

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
    throw new Error(
        '[db] No database configuration found. ' +
        'Set DATABASE_URL or individual PG* environment variables.'
    );
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Fallback to individual vars when DATABASE_URL is absent
    host:     process.env.PGHOST,
    port:     process.env.PGPORT     ? parseInt(process.env.PGPORT, 10) : undefined,
    database: process.env.PGDATABASE,
    user:     process.env.PGUSER,
    password: process.env.PGPASSWORD,

    // Pool tuning
    max:              10,   // max connections in pool
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
    console.error('[db] Unexpected pool error:', err.message);
});

module.exports = pool;
