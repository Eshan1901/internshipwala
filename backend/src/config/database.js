/**
 * PostgreSQL Connection Pool
 *
 * Creates a singleton pg.Pool from DATABASE_URL.
 * Neon requires SSL — enabled automatically in production.
 *
 * Usage:
 *   import { query, pool } from '../config/database.js';
 *
 *   // Simple query
 *   const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
 *
 *   // Transaction (use pool.connect())
 *   const client = await pool.connect();
 *   try {
 *     await client.query('BEGIN');
 *     // ... multiple queries ...
 *     await client.query('COMMIT');
 *   } catch (err) {
 *     await client.query('ROLLBACK');
 *     throw err;
 *   } finally {
 *     client.release();
 *   }
 */

import pg from 'pg';
import { env } from './env.js';
import logger from '../logger/logger.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' || env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log pool errors — do not crash the process
pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

// Log successful connection on first use
pool.on('connect', () => {
  logger.info('PostgreSQL pool: new client connected');
});

/**
 * Execute a parameterised SQL query against the pool.
 *
 * @param {string} text  - SQL query with $1, $2, … placeholders
 * @param {any[]}  [params] - Bind parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Graceful shutdown — drain connections before process exits.
 */
const shutdown = async () => {
  logger.info('Draining PostgreSQL connection pool…');
  await pool.end();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { pool, query };
