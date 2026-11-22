export function BookItem({ book, onToggleRead, onRate, onEdit, onDelete, busyId }) {
  const isBusy = busyId === book.id;

  return (
    <article className="book-item">
      <div className="book-info">
        <div className="book-header">
          <h3>{book.title}</h3>
          <span className="badge">{book.genre}</span>
        </div>
        <p className="book-meta">
          by <strong>{book.author}</strong> · {book.year}
        </p>
      </div>

      <div className="book-actions">
        <button
          type="button"
          className={book.read ? "btn-read" : "btn-unread"}
          disabled={isBusy}
          onClick={() => onToggleRead(book)}
        >
          {book.read ? "✓ Read" : "Mark Read"}
        </button>

        <select
          aria-label={`Rate ${book.title}`}
          disabled={!book.read || isBusy}
          value={book.rating === null ? "" : String(book.rating)}
          onChange={(e) => onRate(book, e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Unrated</option>
          <option value="1">1 ★</option>
          <option value="2">2 ★★</option>
          <option value="3">3 ★★★</option>
          <option value="4">4 ★★★★</option>
          <option value="5">5 ★★★★★</option>
        </select>

        <button type="button" className="btn-secondary" disabled={isBusy} onClick={() => onEdit(book)}>
          Edit
        </button>

        <button type="button" className="btn-danger" disabled={isBusy} onClick={() => onDelete(book.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
