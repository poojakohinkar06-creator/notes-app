<<<<<<< HEAD
# Notes Application

A complete full-stack notes app: compose, search, edit and delete notes through a polished React UI, backed by an Express REST API and a file-based SQLite database. Everything runs locally with free, open-source tooling — no paid services or UI kits.

---

## Features

- **Create notes** with a title and content via an accessible modal form (client + server validation).
- **Edit notes** inline in the same modal, with live character counters (100 title / 5000 content).
- **Delete notes** behind a confirmation dialog that names the note being removed.
- **Search** across title *and* content, case-insensitive, debounced (300 ms) and served by the API with `?search=`, so the UI always reflects the database.
- **Responsive layouts**: card grid (1 column mobile → 2 tablet → 3+ desktop) with a cards/list view toggle, persisted to `localStorage`.
- **Loading, empty and error states**, including a "no results for …" state with a clear-search action.
- **Custom toast notifications** for successes *and* failures — if the server is down you get a clear error toast instead of a crash, with a retry option.
- **Accessible**: labelled inputs, keyboard-navigable modals (Escape closes, Tab trapped, focus restored), `aria-pressed` toggles, live regions for search results and toasts, WCAG-AA contrast.
- **Reliable sync**: every create/update/delete re-syncs with the API, so client state always matches the database.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 6, plain CSS (no UI kit) |
| Backend | Node.js 20+, Express 4 |
| Database | SQLite via `better-sqlite3` (file-based, WAL mode) |
| Testing | `node:test` (built-in) + `supertest` |
| Tooling | `concurrently` (root `dev` script), `dotenv`, `cors` |

## Architecture overview

```
 Browser (React SPA)                 Node.js process
┌─────────────────────────┐  HTTP   ┌──────────────────────────────────┐
│ App.jsx                 │ ──────► │ Express app (app.js)            │
│  ├─ useNotes hook       │  JSON   │  ├─ cors + express.json          │
│  ├─ notesApi (fetch)    │         │  ├─ /api/notes routes           │
│  └─ components + toasts │ ◄────── │  ├─ controllers (validation)     │
└─────────────────────────┘         │  ├─ middleware (404 / errors)    │
                                    │  └─ better-sqlite3 ──► notes.db  │
                                    └──────────────────────────────────┘
```

**Client flow:** `App.jsx` keeps the search query, view mode and modal state. `useDebounce` delays the query 300 ms, then `useNotes` calls `GET /api/notes?search=…` (a request-sequence guard prevents stale responses from overwriting newer ones). Mutations (`POST`/`PUT`/`DELETE`) go through `notesApi`, apply an optimistic update filtered with the same matching rule the server uses, and then silently re-fetch from the server so the rendered state is authoritative. Failures (including "server unreachable") are surfaced as error toasts by a small custom `ToastProvider`.

**Server flow:** `app.js` wires CORS (origin from `CLIENT_URL`), JSON parsing, the `/api/notes` router, then a 404 handler and one centralized error handler. Controllers validate input (`title` required, ≤ 100 chars; `content` required, ≤ 5000 chars) and translate failures into `400`/`404` JSON responses of the form `{ "error": "message" }`. The database connection is created lazily by `server/db/index.js`, which also ensures the schema exists.

## Folder structure

```
.
├── package.json              # root scripts: install:all, dev, start, test
├── README.md
├── .env.example              # PORT, CLIENT_URL, DB_PATH
├── .gitignore
├── client/                   # React + Vite app
│   ├── index.html
│   ├── vite.config.js
│   ├── api/notesApi.js       # fetch wrapper + typed API functions
│   ├── hooks/                # useNotes, useDebounce
│   ├── components/           # App views: NoteCard, NoteFormModal, Toast, …
│   ├── styles/               # global.css, components.css, modal.css, toast.css
│   ├── src/                  # main.jsx, App.jsx
│   └── utils/formatDate.js
└── server/                   # Express API
    ├── package.json
    ├── app.js                # express app factory
    ├── server.js             # entry point (listen + graceful shutdown)
    ├── routes/notes.routes.js
    ├── controllers/notes.controller.js
    ├── middleware/           # AppError, validate, errorHandler (404 + centralized)
    ├── db/
    │   ├── schema.sql        # table definition
    │   ├── index.js          # connection + schema bootstrap
    │   ├── setup.js          # npm run db:setup
    │   └── seed.js           # npm run db:seed (5 sample notes)
    └── tests/notes.test.js   # API tests (node:test + supertest)
```

## Database schema

`server/db/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

The database file defaults to `server/data/notes.db` (configurable with `DB_PATH`) and is created automatically on first run. WAL mode is enabled for safer concurrent reads/writes.

## API reference

Base URL: `http://localhost:4000` — all responses are JSON (except `204`).

| Method | Endpoint | Query / Body | Success | Errors |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | – | `200` `{ status, time }` | – |
| `GET` | `/api/notes` | `?search=term` (optional; matches title **or** content, case-insensitive) | `200` `{ data: Note[], count }` | `500` `{ error }` |
| `GET` | `/api/notes/:id` | – | `200` `{ data: Note }` | `400` bad id, `404`, `500` |
| `POST` | `/api/notes` | `{ title, content }` | `201` `{ data: Note }` | `400` validation / bad JSON, `500` |
| `PUT` | `/api/notes/:id` | `{ title, content }` (either or both) | `200` `{ data: Note }` | `400`, `404`, `500` |
| `DELETE` | `/api/notes/:id` | – | `204` (no body) | `400`, `404`, `500` |

**Validation rules:** `title` — required non-empty string, max 100 characters; `content` — required non-empty string, max 5000 characters. Whitespace around the title is trimmed. Errors always use the shape `{ "error": "message" }`.

**Note object**

```json
{
  "id": 1,
  "title": "Shopping list",
  "content": "Milk, eggs, bread…",
  "created_at": "2026-10-18 12:00:00",
  "updated_at": "2026-10-18 12:00:00"
}
```

CORS is enabled for the origin in `CLIENT_URL` (the Vite dev server).

## Local setup (step by step)

Prerequisites: Node.js 18+ and npm.

```bash
# 1. Clone / open the project, then install every workspace
npm run install:all

# 2. Configure environment (defaults work out of the box)
cp .env.example .env

# 3. Create the SQLite database from schema.sql
npm run db:setup

# 4. (Optional) load 5 sample notes
npm run db:seed

# 5. Run API + client together (http://localhost:4000 + http://localhost:5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

Other commands:

```bash
npm start          # API only (production-style, serves the API on PORT)
npm run build      # production build of the client into client/dist
npm test           # run the backend API tests
```

Environment variables (`.env` at the project root):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API server port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `DB_PATH` | `./data/notes.db` | SQLite file location (relative to `server/`) |
| `VITE_API_BASE_URL` | `http://localhost:4000` | Optional, set in `client/.env` if the API is hosted elsewhere |

No secrets are hard-coded; `.env` is git-ignored and `.env.example` documents every key.

## Running tests

```bash
npm test                # from the root, or: npm test --prefix server
```

The suite (`server/tests/notes.test.js`) uses the built-in Node test runner with `supertest` against a throwaway database in the OS temp directory. It covers:

- listing (empty state) and case-insensitive search by title and content,
- `POST` creation plus every validation rule (missing title/content, >100 title, >5000 content, malformed JSON),
- `GET` by id (`200` / `404` / `400` for non-numeric ids),
- `PUT` updates (`200`), missing note (`404`), invalid body (`400`),
- `DELETE` (`204` then `404` on repeat), and the JSON `404` handler for unknown routes.

## Screenshots

_Add screenshots to `docs/screenshots/` and reference them here once captured:_

| File | What to capture |
| --- | --- |
| `docs/screenshots/grid-view.png` | Home screen with seeded notes in card view (desktop, 3 columns). |
| `docs/screenshots/list-view.png` | The same notes after switching to list view. |
| `docs/screenshots/mobile.png` | Single-column responsive layout at phone width. |
| `docs/screenshots/search.png` | Search box with a term and the filtered results. |
| `docs/screenshots/create-modal.png` | The "New note" modal with validation counters. |
| `docs/screenshots/edit-modal.png` | The edit modal prefilled with an existing note. |
| `docs/screenshots/delete-confirm.png` | The delete confirmation dialog. |
| `docs/screenshots/toast-success.png` | Success toast after creating a note. |
| `docs/screenshots/server-down-error.png` | Error toast shown while the API is stopped. |
| `docs/screenshots/empty-state.png` | Empty state (no notes) and the no-results state. |
| `docs/screenshots/tests.png` | Terminal output of the passing API test suite. |

> **Note:** capture at 1440×900 for desktop shots and 390×844 for mobile; include the empty/no-results and server-down states since they demonstrate loading, empty and error handling.

## Future improvements

- Authentication (per-user notes with sessions/JWT) and multi-user sharing.
- Tags/categories, pinning, colour labels and full-text search with FTS5.
- Pagination or infinite scroll for large note collections.
- Optimistic concurrency (If-Unmodified-Since / revision numbers) for conflicting edits.
- Attachments (images) with local file storage.
- Rate limiting, request logging (pino/morgan), and helmet security headers.
- E2E tests (Playwright) and CI pipeline; Docker images for one-command runs.
- Offline support with a service worker and background sync.
- Keyboard shortcut palette and drag-and-drop board view.
=======
# notes-app
Full-stack Notes app with React, Express and SQLite. Create, edit, search and delete notes with a responsive card/list UI, dark mode and toast notifications.
>>>>>>> 0f78b9a3d2ecc2d1a1c7d466d130b278c4a353b2
