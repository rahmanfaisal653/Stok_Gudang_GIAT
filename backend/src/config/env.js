const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toOrigins = (value) => (value || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  port: toNumber(process.env.PORT, 3001),
  corsOrigins: toOrigins(process.env.CORS_ORIGIN),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'atk_giat',
    connectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  },
};
