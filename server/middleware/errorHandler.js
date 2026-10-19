const AppError = require('./AppError');

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Centralized error handler - always last middleware.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body too large';
  } else if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({ error: message });
}

module.exports = { notFoundHandler, errorHandler };
