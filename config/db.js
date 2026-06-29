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

  // Some hosts (FreeDB included) work fine without TLS on the free tier.
  // Set DB_SSL=true in .env if your host requires an encrypted connection.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;
