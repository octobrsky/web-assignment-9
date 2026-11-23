import { BookItem } from "./BookItem.jsx";

export function BookList({ books, loading, onToggleRead, onRate, onEdit, onDelete, busyId }) {
  if (loading) {
    return <div className="card state-box">Loading books from server...</div>;
  }

  if (books.length === 0) {
    return <div className="card state-box">No books match your current filters.</div>;
  }

  return (
    <section className="book-list" aria-label="Books">
      <p className="results-count">
        Showing <strong>{books.length}</strong> {books.length === 1 ? "book" : "books"}
      </p>
      {books.map((book) => (
        <BookItem
          key={book.id}
          book={book}
          onToggleRead={onToggleRead}
          onRate={onRate}
          onEdit={onEdit}
          onDelete={onDelete}
          busyId={busyId}
        />
      ))}
    </section>
  );
}
