import Modal from './Modal';

export default function ConfirmDialog({ note, onConfirm, onCancel, busy }) {
  return (
    <Modal onClose={onCancel} labelledBy="confirm-delete-title" className="modal--small">
      <div className="confirm">
        <header className="modal__header">
          <h2 id="confirm-delete-title" className="modal__title">
            Delete note?
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onCancel}
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
          <div className="confirm__icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </div>

          <p className="confirm__text">
            <strong>&ldquo;{note.title}&rdquo;</strong> will be permanently deleted. This
            action cannot be undone.
          </p>
        </div>

        <footer className="modal__footer">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            data-autofocus
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </footer>
      </div>
    </Modal>
  );
}
