import { useState } from 'react';
import Modal from './Modal';

const MAX_TITLE = 100;
const MAX_CONTENT = 5000;

function counterClass(length, max) {
  if (length > max) return 'field__counter field__counter--over';
  if (length >= max * 0.9) return 'field__counter field__counter--warn';
  return 'field__counter';
}

export default function NoteFormModal({ note, onSubmit, onClose }) {
  const isEdit = Boolean(note);
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const headingId = isEdit ? 'edit-note-title' : 'new-note-title';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    const trimmedTitle = title.trim();
    let valid = true;

    if (!trimmedTitle) {
      setTitleError('Title is required.');
      valid = false;
    } else if (trimmedTitle.length > MAX_TITLE) {
      setTitleError(`Title must be ${MAX_TITLE} characters or fewer.`);
      valid = false;
    } else {
      setTitleError('');
    }

    if (!content.trim()) {
      setContentError('Content is required.');
      valid = false;
    } else if (content.length > MAX_CONTENT) {
      setContentError(`Content must be ${MAX_CONTENT} characters or fewer.`);
      valid = false;
    } else {
      setContentError('');
    }

    if (!valid) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: trimmedTitle, content });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy={headingId}>
      <form className="note-form" onSubmit={handleSubmit} noValidate>
        <header className="modal__header">
          <h2 id={headingId} className="modal__title">
            {isEdit ? 'Edit note' : 'New note'}
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <div className="modal__body">
          <div className="field">
            <label htmlFor="note-title" className="field__label">
              Title
            </label>
            <input
              id="note-title"
              name="title"
              type="text"
              className={`field__input ${titleError ? 'field__input--invalid' : ''}`.trim()}
              value={title}
              maxLength={MAX_TITLE}
              placeholder="e.g. Meeting notes"
              data-autofocus
              autoComplete="off"
              aria-required="true"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'note-title-error' : 'note-title-count'}
              onChange={(event) => setTitle(event.target.value)}
            />
            <div className="field__meta">
              <span
                id="note-title-error"
                className="field__error"
                role={titleError ? 'alert' : undefined}
              >
                {titleError}
              </span>
              <span id="note-title-count" className={counterClass(title.length, MAX_TITLE)}>
                {title.length}/{MAX_TITLE}
              </span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="note-content" className="field__label">
              Content
            </label>
            <textarea
              id="note-content"
              name="content"
              className={`field__input field__textarea ${contentError ? 'field__input--invalid' : ''}`.trim()}
              value={content}
              maxLength={MAX_CONTENT}
              rows={8}
              placeholder="Write your note…"
              aria-required="true"
              aria-invalid={Boolean(contentError)}
              aria-describedby={contentError ? 'note-content-error' : 'note-content-count'}
              onChange={(event) => setContent(event.target.value)}
            />
            <div className="field__meta">
              <span
                id="note-content-error"
                className="field__error"
                role={contentError ? 'alert' : undefined}
              >
                {contentError}
              </span>
              <span
                id="note-content-count"
                className={counterClass(content.length, MAX_CONTENT)}
              >
                {content.length}/{MAX_CONTENT}
              </span>
            </div>
          </div>

          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}
        </div>

        <footer className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create note'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
