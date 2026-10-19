const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

// Supertest opens an ephemeral server per request; disable keep-alive so the
// sockets are released immediately instead of holding the process open.
http.globalAgent.keepAlive = false;

const TEST_DB = path.join(os.tmpdir(), `notes-test-${process.pid}-${Date.now()}.db`);
process.env.DB_PATH = TEST_DB;
process.env.CLIENT_URL = 'http://localhost:5173';

const request = require('supertest');
const { createApp, initDatabase } = require('../app');
const { closeDb } = require('../db');

const app = createApp();

before(
  () => {
    fs.rmSync(TEST_DB, { force: true });
    fs.rmSync(`${TEST_DB}-wal`, { force: true });
    fs.rmSync(`${TEST_DB}-shm`, { force: true });
    initDatabase();
  },
  { timeout: 120000 }
);

after(
  () => {
    closeDb();
    fs.rmSync(TEST_DB, { force: true });
    fs.rmSync(`${TEST_DB}-wal`, { force: true });
    fs.rmSync(`${TEST_DB}-shm`, { force: true });
  },
  { timeout: 120000 }
);

test('GET /api/notes returns 200 with an empty list initially', async () => {
  const res = await request(app).get('/api/notes');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body.data, []);
  assert.strictEqual(res.body.count, 0);
});

test('POST /api/notes creates a note and returns 201', async () => {
  const res = await request(app)
    .post('/api/notes')
    .send({ title: 'First note', content: 'Hello world' });

  assert.strictEqual(res.status, 201);
  assert.ok(res.body.data.id);
  assert.strictEqual(res.body.data.title, 'First note');
  assert.strictEqual(res.body.data.content, 'Hello world');
  assert.ok(res.body.data.created_at);
  assert.ok(res.body.data.updated_at);
});

test('POST /api/notes rejects a missing title with 400', async () => {
  const res = await request(app).post('/api/notes').send({ content: 'no title' });
  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /title/i);
});

test('POST /api/notes rejects a title longer than 100 chars with 400', async () => {
  const res = await request(app)
    .post('/api/notes')
    .send({ title: 'x'.repeat(101), content: 'ok' });
  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /title/i);
});

test('POST /api/notes rejects content longer than 5000 chars with 400', async () => {
  const res = await request(app)
    .post('/api/notes')
    .send({ title: 'ok', content: 'y'.repeat(5001) });
  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /content/i);
});

test('POST /api/notes rejects a missing content with 400', async () => {
  const res = await request(app).post('/api/notes').send({ title: 'only title' });
  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /content/i);
});

test('POST /api/notes rejects malformed JSON with 400', async () => {
  const res = await request(app)
    .post('/api/notes')
    .set('Content-Type', 'application/json')
    .send('{"title": ');
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /api/notes/:id returns a note, or 404 when missing', async () => {
  const created = await request(app)
    .post('/api/notes')
    .send({ title: 'Fetch me', content: 'content here' });
  const id = created.body.data.id;

  const found = await request(app).get(`/api/notes/${id}`);
  assert.strictEqual(found.status, 200);
  assert.strictEqual(found.body.data.title, 'Fetch me');

  const missing = await request(app).get('/api/notes/999999');
  assert.strictEqual(missing.status, 404);
  assert.ok(missing.body.error);
});

test('GET /api/notes/:id rejects a non-numeric id with 400', async () => {
  const res = await request(app).get('/api/notes/abc');
  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /id/i);
});

test('GET /api/notes?search= filters case-insensitively by title and content', async () => {
  await request(app)
    .post('/api/notes')
    .send({ title: 'Grocery list', content: 'buy apples and bread' });
  await request(app)
    .post('/api/notes')
    .send({ title: 'Weekend plan', content: 'hike then APPLES pie' });

  const byTitle = await request(app).get('/api/notes').query({ search: 'grocery' });
  assert.strictEqual(byTitle.status, 200);
  assert.ok(byTitle.body.data.some((n) => n.title === 'Grocery list'));

  const byContent = await request(app).get('/api/notes').query({ search: 'Apples' });
  assert.strictEqual(byContent.status, 200);
  assert.ok(byContent.body.data.length >= 2);

  const noMatch = await request(app).get('/api/notes').query({ search: 'zzz-no-match' });
  assert.strictEqual(noMatch.status, 200);
  assert.strictEqual(noMatch.body.count, 0);
});

test('PUT /api/notes/:id updates a note and returns 200', async () => {
  const created = await request(app)
    .post('/api/notes')
    .send({ title: 'Old title', content: 'Old content' });
  const id = created.body.data.id;

  const res = await request(app)
    .put(`/api/notes/${id}`)
    .send({ title: 'New title', content: 'New content' });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.title, 'New title');
  assert.strictEqual(res.body.data.content, 'New content');

  const fetched = await request(app).get(`/api/notes/${id}`);
  assert.strictEqual(fetched.body.data.title, 'New title');
});

test('PUT /api/notes/:id returns 404 for a missing note', async () => {
  const res = await request(app)
    .put('/api/notes/999999')
    .send({ title: 'x', content: 'y' });
  assert.strictEqual(res.status, 404);
});

test('PUT /api/notes/:id returns 400 for an invalid body', async () => {
  const created = await request(app)
    .post('/api/notes')
    .send({ title: 'Valid', content: 'Valid' });
  const id = created.body.data.id;

  const res = await request(app).put(`/api/notes/${id}`).send({ title: '' });
  assert.strictEqual(res.status, 400);

  const empty = await request(app).put(`/api/notes/${id}`).send({});
  assert.strictEqual(empty.status, 400);
});

test('DELETE /api/notes/:id returns 204 then 404 on a second delete', async () => {
  const created = await request(app)
    .post('/api/notes')
    .send({ title: 'Delete me', content: 'temporary' });
  const id = created.body.data.id;

  const first = await request(app).delete(`/api/notes/${id}`);
  assert.strictEqual(first.status, 204);

  const second = await request(app).delete(`/api/notes/${id}`);
  assert.strictEqual(second.status, 404);
});

test('unknown routes return 404 JSON', async () => {
  const res = await request(app).get('/api/nope');
  assert.strictEqual(res.status, 404);
  assert.ok(res.body.error);
});
