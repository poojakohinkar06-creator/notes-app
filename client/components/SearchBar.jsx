import { forwardRef } from 'react';

const SearchBar = forwardRef(function SearchBar({ value, onChange }, ref) {
  return (
    <div className="search">
      <label htmlFor="note-search" className="visually-hidden">
        Search notes by title or content
      </label>
      <span className="search__icon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        id="note-search"
        ref={ref}
        type="search"
        className="search__input"
        placeholder="Search notes by title or content…"
        value={value}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
      <kbd className="search__hint" aria-hidden="true">
        Ctrl K
      </kbd>
    </div>
  );
});

export default SearchBar;
