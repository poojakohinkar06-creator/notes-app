const express = require('express');
const cors = require('cors');
const notesRouter = require('./routes/notes.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { getDb } = require('./db');

function createApp() {
  const app = express();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  app.use(cors({ origin: clientUrl, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/notes', notesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function initDatabase() {
  getDb();
}

module.exports = { createApp, initDatabase };
