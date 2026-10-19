export default function ViewToggle({ view, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label="Change notes layout">
      <button
        type="button"
        className={`view-toggle__btn ${view === 'grid' ? 'is-active' : ''}`.trim()}
        aria-pressed={view === 'grid'}
        onClick={() => onChange('grid')}
        title="Card view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1.2" />
          <rect x="9" y="1" width="6" height="6" rx="1.2" />
          <rect x="1" y="9" width="6" height="6" rx="1.2" />
          <rect x="9" y="9" width="6" height="6" rx="1.2" />
        </svg>
        <span className="view-toggle__label">Cards</span>
      </button>
      <button
        type="button"
        className={`view-toggle__btn ${view === 'list' ? 'is-active' : ''}`.trim()}
        aria-pressed={view === 'list'}
        onClick={() => onChange('list')}
        title="List view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
          <rect x="1" y="2" width="14" height="2.4" rx="1.2" />
          <rect x="1" y="6.8" width="14" height="2.4" rx="1.2" />
          <rect x="1" y="11.6" width="14" height="2.4" rx="1.2" />
        </svg>
        <span className="view-toggle__label">List</span>
      </button>
    </div>
  );
}
