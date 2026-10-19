const { createApp, initDatabase } = require('./app');
const { resolveDbPath } = require('./db');

const PORT = Number(process.env.PORT) || 4000;

initDatabase();

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log(`Database: ${resolveDbPath()}`);
});

function shutdown() {
  server.close(() => {
    require('./db').closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
