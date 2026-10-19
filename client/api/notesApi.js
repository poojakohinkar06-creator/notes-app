const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err && err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Please check your connection.', 0);
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && payload.error) || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload && 'data' in payload ? payload.data : payload;
}

export function listNotes(search = '', signal) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/api/notes${query}`, { signal });
}

export function getNote(id, signal) {
  return request(`/api/notes/${id}`, { signal });
}

export function createNote(data) {
  return request('/api/notes', { method: 'POST', body: data });
}

export function updateNote(id, data) {
  return request(`/api/notes/${id}`, { method: 'PUT', body: data });
}

export function deleteNote(id) {
  return request(`/api/notes/${id}`, { method: 'DELETE' });
}
