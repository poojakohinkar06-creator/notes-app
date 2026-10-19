import { formatDateTime, relativeTime } from '../utils/formatDate';

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function NoteCard({ note, view, onEdit, onDelete, index }) {
  const created = formatDateTime(note.created_at);
  const updated = formatDateTime(note.updated_at);

  return (
    <article
      className={`note note--${view}`}
      aria-labelledby={`note-title-${note.id}`}
      style={{ '--i': index }}
    >
      <div className="note__body">
        <h3 className="note__title" id={`note-title-${note.id}`}>
          {note.title}
        </h3>
        <p className="note__content">{note.content}</p>
      </div>
      <footer className="note__footer">
        <div className="note__meta">
          <ClockIcon />
          <time dateTime={note.created_at} title={`Created ${created}`}>
            Created {relativeTime(note.created_at)}
          </time>
          <span className="note__meta-divider" aria-hidden="true">
            ·
          </span>
          <time dateTime={note.updated_at} title={`Updated ${updated}`}>
            Updated {relativeTime(note.updated_at)}
          </time>
        </div>
        <div className="note__actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => onEdit(note)}
            aria-label={`Edit note: ${note.title}`}
            title="Edit note"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            onClick={() => onDelete(note)}
            aria-label={`Delete note: ${note.title}`}
            title="Delete note"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </footer>
    </article>
  );
}
