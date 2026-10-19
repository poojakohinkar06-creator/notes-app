function NotesIllustration() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M9 7h7" />
      <path d="M9 11h5" />
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
      <path d="M8.5 11h5" />
    </svg>
  );
}

function AlertIllustration() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function SkeletonCard({ row }) {
  return (
    <div className={`skeleton ${row ? 'skeleton--row' : ''}`.trim()}>
      <span className="skeleton__bar skeleton__bar--title" />
      <span className="skeleton__bar" />
      <span className="skeleton__bar" />
      <span className="skeleton__bar skeleton__bar--short" />
      <span className="skeleton__bar skeleton__bar--meta" />
    </div>
  );
}

export function LoadingState({ label = 'Loading notes…', view = 'grid' }) {
  const isList = view === 'list';
  const count = isList ? 4 : 6;

  return (
    <div className="state-block" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className={isList ? 'notes-list' : 'notes-grid'} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} row={isList} />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ heading, message, actionLabel, onAction, icon }) {
  return (
    <div className="state state--empty">
      <div className="state__art" aria-hidden="true">
        {icon === 'search' ? <SearchIllustration /> : <NotesIllustration />}
      </div>
      <h2 className="state__heading">{heading}</h2>
      <p className="state__message">{message}</p>
      {actionLabel && (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__art" aria-hidden="true">
        <AlertIllustration />
      </div>
      <h2 className="state__heading">Could not load notes</h2>
      <p className="state__message">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
