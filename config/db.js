'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // fail fast (10s) instead of hanging silently

  // Some hosts (FreeDB included) work fine without TLS on the free tier.
  // Set DB_SSL=true in .env if your host requires an encrypted connection.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

/* ── TEMP DEBUG: test the connection once on boot and log the REAL error ── */
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ DB connected OK ->', process.env.DB_HOST, process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ DB CONNECTION FAILED ON STARTUP');
    console.error('   host:', process.env.DB_HOST, '| port:', process.env.DB_PORT, '| db:', process.env.DB_NAME, '| user:', process.env.DB_USER);
    console.error('   code:', err.code, '| errno:', err.errno, '| message:', err.message);
  }
})();

module.exports = pool;
