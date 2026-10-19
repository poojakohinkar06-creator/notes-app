const AppError = require('./AppError');

const MAX_TITLE = 100;
const MAX_CONTENT = 5000;

function validateNoteInput(body, { requireAll = true } = {}) {
  const errors = [];
  const data = {};

  if (body.title !== undefined || requireAll) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      errors.push('title is required and must be a non-empty string');
    } else if (body.title.trim().length > MAX_TITLE) {
      errors.push(`title must be at most ${MAX_TITLE} characters`);
    } else {
      data.title = body.title.trim();
    }
  }

  if (body.content !== undefined || requireAll) {
    if (typeof body.content !== 'string' || !body.content.trim()) {
      errors.push('content is required and must be a non-empty string');
    } else if (body.content.length > MAX_CONTENT) {
      errors.push(`content must be at most ${MAX_CONTENT} characters`);
    } else {
      data.content = body.content;
    }
  }

  if (errors.length) {
    throw new AppError(errors.join('; '), 400);
  }

  return data;
}

function validateNoteId(req, _res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new AppError('id must be a positive integer', 400));
  }
  req.params.id = id;
  next();
}

module.exports = { validateNoteInput, validateNoteId, MAX_TITLE, MAX_CONTENT };
