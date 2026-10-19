const { getDb } = require('../db');
const AppError = require('../middleware/AppError');
const { validateNoteInput } = require('../middleware/validate');

const SELECT_NOTE = 'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?';

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function listNotes(req, res, next) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const db = getDb();
    let rows;

    if (search) {
      const pattern = `%${escapeLike(search.toLowerCase())}%`;
      rows = db
        .prepare(
          `SELECT id, title, content, created_at, updated_at FROM notes
           WHERE LOWER(title) LIKE ? ESCAPE '\\'
              OR LOWER(content) LIKE ? ESCAPE '\\'
           ORDER BY updated_at DESC, id DESC`
        )
        .all(pattern, pattern);
    } else {
      rows = db
        .prepare(
          'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC, id DESC'
        )
        .all();
    }

    res.status(200).json({ data: rows, count: rows.length });
  } catch (err) {
    next(err);
  }
}

function getNote(req, res, next) {
  try {
    const note = getDb().prepare(SELECT_NOTE).get(req.params.id);
    if (!note) throw new AppError('Note not found', 404);
    res.status(200).json({ data: note });
  } catch (err) {
    next(err);
  }
}

function createNote(req, res, next) {
  try {
    const { title, content } = validateNoteInput(req.body);
    const result = getDb()
      .prepare('INSERT INTO notes (title, content) VALUES (?, ?)')
      .run(title, content);

    const note = getDb().prepare(SELECT_NOTE).get(result.lastInsertRowid);
    res.status(201).json({ data: note });
  } catch (err) {
    next(err);
  }
}

function updateNote(req, res, next) {
  try {
    const db = getDb();
    const existing = db.prepare(SELECT_NOTE).get(req.params.id);
    if (!existing) throw new AppError('Note not found', 404);

    const patch = validateNoteInput(req.body, { requireAll: false });
    if (!Object.keys(patch).length) {
      throw new AppError('Provide title and/or content to update', 400);
    }

    const title = patch.title !== undefined ? patch.title : existing.title;
    const content = patch.content !== undefined ? patch.content : existing.content;

    db.prepare(
      "UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(title, content, req.params.id);

    res.status(200).json({ data: db.prepare(SELECT_NOTE).get(req.params.id) });
  } catch (err) {
    next(err);
  }
}

function deleteNote(req, res, next) {
  try {
    const result = getDb().prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    if (result.changes === 0) throw new AppError('Note not found', 404);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotes, getNote, createNote, updateNote, deleteNote };
