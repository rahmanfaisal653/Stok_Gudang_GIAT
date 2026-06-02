const express = require('express');
const cors = require('cors');
const { corsOrigins } = require('./config/env');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }));

  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));
  app.use('/', inventoryRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
