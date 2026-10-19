import { useCallback, useEffect, useRef, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ViewToggle from '../components/ViewToggle';
import NoteCard from '../components/NoteCard';
import NoteFormModal from '../components/NoteFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import { useToast } from '../components/Toast';
import { useNotes } from '../hooks/useNotes';
import { useDebounce } from '../hooks/useDebounce';

const VIEW_STORAGE_KEY = 'notes:view';
const THEME_STORAGE_KEY = 'notes:theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const toast = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'grid';
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid';
  });

  const [theme, setTheme] = useState(getInitialTheme);
  const [modal, setModal] = useState(null); // { mode: 'create' } | { mode: 'edit', note }
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const searchRef = useRef(null);
  const { notes, loading, refreshing, error, createNote, updateNote, removeNote, reload } =
    useNotes(debouncedSearch);

  const lastErrorRef = useRef(null);
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      toast.error(error);
      lastErrorRef.current = error;
    }
    if (!error) lastErrorRef.current = null;
  }, [error, toast]);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  // Keep <html data-theme> in sync with the chosen theme.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Follow the OS preference live until the user picks a theme explicitly.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      let stored = null;
      try {
        stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        /* storage unavailable */
      }
      if (stored !== 'light' && stored !== 'dark') {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((previous) => {
      const next = previous === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCreate = useCallback(
    async (data) => {
      try {
        await createNote(data);
        toast.success('Note created');
      } catch (err) {
        toast.error(err.message);
        throw err;
      }
    },
    [createNote, toast]
  );

  const handleUpdate = useCallback(
    async (data) => {
      try {
        await updateNote(modal?.note?.id, data);
        toast.success('Note updated');
      } catch (err) {
        toast.error(err.message);
        throw err;
      }
    },
    [updateNote, modal, toast]
  );

  const handleDelete = useCallback(async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await removeNote(deleting.id);
      toast.success('Note deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingBusy(false);
    }
  }, [deleting, removeNote, toast]);

  const hasNotes = notes.length > 0;
  const showLoading = loading && !hasNotes;
  const showError = !loading && error && !hasNotes;
  const showEmpty = !loading && !error && !hasNotes;

  const isDark = theme === 'dark';

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </span>
            <div>
              <h1 className="brand__title">Notes</h1>
              <p className="brand__subtitle">Capture ideas, find them instantly</p>
            </div>
          </div>

          <SearchBar ref={searchRef} value={search} onChange={setSearch} />

          <div className="toolbar">
            <ViewToggle view={view} onChange={setView} />
            <button
              type="button"
              className="icon-button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setModal({ mode: 'create' })}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              New note
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-main__meta" aria-live="polite">
          {!loading && !error && (
            <p className="result-count">
              {debouncedSearch
                ? `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} matching “${debouncedSearch}”`
                : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
            </p>
          )}
          {refreshing && <span className="syncing">Syncing…</span>}
        </div>

        {showLoading && <LoadingState view={view} />}

        {showError && <ErrorState message={error} onRetry={reload} />}

        {showEmpty &&
          (debouncedSearch ? (
            <EmptyState
              icon="search"
              heading="No matching notes"
              message={`Nothing matches “${debouncedSearch}”. Try a different keyword.`}
              actionLabel="Clear search"
              onAction={() => setSearch('')}
            />
          ) : (
            <EmptyState
              heading="No notes yet"
              message="Create your first note and it will show up here — it only takes a second."
              actionLabel="Create a note"
              onAction={() => setModal({ mode: 'create' })}
            />
          ))}

        {!loading && hasNotes && (
          <section
            className={view === 'grid' ? 'notes-grid' : 'notes-list'}
            aria-label="Notes"
          >
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                view={view}
                onEdit={(target) => setModal({ mode: 'edit', note: target })}
                onDelete={(target) => setDeleting(target)}
              />
            ))}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React, Express and SQLite — all data stays on your machine.</p>
      </footer>

      {modal && (
        <NoteFormModal
          key={modal.mode === 'edit' ? `edit-${modal.note.id}` : 'create'}
          note={modal.mode === 'edit' ? modal.note : null}
          onSubmit={modal.mode === 'edit' ? handleUpdate : handleCreate}
          onClose={() => setModal(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          note={deleting}
          busy={deletingBusy}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
