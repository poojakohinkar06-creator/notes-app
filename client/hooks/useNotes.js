import { useCallback, useEffect, useRef, useState } from 'react';
import * as notesApi from '../api/notesApi';

function matchesSearch(note, term) {
  if (!term) return true;
  const needle = term.toLowerCase();
  return (
    note.title.toLowerCase().includes(needle) ||
    note.content.toLowerCase().includes(needle)
  );
}

export function useNotes(search) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const seqRef = useRef(0);

  const load = useCallback(
    async (term, { silent = false } = {}) => {
      const seq = ++seqRef.current;
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await notesApi.listNotes(term);
        if (seq !== seqRef.current) return;
        setNotes(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (seq !== seqRef.current || err.name === 'AbortError') return;
        setError(err.message || 'Failed to load notes');
      } finally {
        if (seq === seqRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    load(search);
  }, [search, load]);

  const resync = useCallback(async () => {
    try {
      await load(search, { silent: true });
    } catch {
      /* optimistic state already applied */
    }
  }, [load, search]);

  const createNote = useCallback(
    async (input) => {
      const created = await notesApi.createNote(input);
      setNotes((prev) =>
        matchesSearch(created, search) ? [created, ...prev] : prev
      );
      await resync();
      return created;
    },
    [search, resync]
  );

  const updateNote = useCallback(
    async (id, input) => {
      const updated = await notesApi.updateNote(id, input);
      setNotes((prev) => {
        const rest = prev.filter((note) => note.id !== updated.id);
        return matchesSearch(updated, search) ? [updated, ...rest] : rest;
      });
      await resync();
      return updated;
    },
    [search, resync]
  );

  const removeNote = useCallback(
    async (id) => {
      await notesApi.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      await resync();
    },
    [resync]
  );

  const reload = useCallback(() => {
    setError(null);
    load(search);
  }, [load, search]);

  return {
    notes,
    loading,
    refreshing,
    error,
    createNote,
    updateNote,
    removeNote,
    reload,
  };
}
