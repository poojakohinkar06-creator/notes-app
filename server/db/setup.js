const fs = require('fs');
const { getDb, resolveDbPath, SCHEMA_PATH } = require('./index');

const db = getDb();
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

console.log(`Database ready at ${resolveDbPath()}`);
console.log('Schema applied:', SCHEMA_PATH);
