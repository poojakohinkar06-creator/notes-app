const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function resolveDbPath() {
  const raw = process.env.DB_PATH || path.join('data', 'notes.db');
  return path.isAbsolute(raw) ? raw : path.join(__dirname, '..', raw);
}

let db = null;

function getDb() {
  if (!db) {
    const dbPath = resolveDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  }
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

function resetDb(nextDbPath) {
  closeDb();
  process.env.DB_PATH = nextDbPath;
  return getDb();
}

module.exports = { getDb, closeDb, resetDb, resolveDbPath, SCHEMA_PATH };
