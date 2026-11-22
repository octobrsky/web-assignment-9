import { useState, useEffect, useCallback } from "react";
import {
  fetchBooks,
  fetchStats,
  createBook,
  updateBookPut,
  patchBook,
  removeBook
} from "./api/books.js";
import { StatsPanel } from "./components/StatsPanel.jsx";
import { FilterBar } from "./components/FilterBar.jsx";
import { BookForm } from "./components/BookForm.jsx";
import { BookList } from "./components/BookList.jsx";

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    genre: "",
    read: "",
    sort: "",
    order: "asc"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const loadData = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const [booksData, statsData] = await Promise.all([
          fetchBooks(filters, signal),
          fetchStats(signal)
        ]);
        setBooks(booksData);
        setStats(statsData);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  async function handleFormSubmit(payload, editId) {
    setSubmitting(true);
    setError("");
    try {
      if (editId !== null) {
        await updateBookPut(editId, payload);
        setEditingBook(null);
      } else {
        await createBook(payload);
      }
      await loadData();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleRead(book) {
    setBusyId(book.id);
    setError("");
    try {
      const nextRead = !book.read;
      const patchPayload = nextRead ? { read: true } : { read: false, rating: null };
      await patchBook(book.id, patchPayload);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRate(book, newRating) {
    setBusyId(book.id);
    setError("");
    try {
      await patchBook(book.id, { rating: newRating });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    setBusyId(id);
    setError("");
    try {
      await removeBook(id);
      if (editingBook && editingBook.id === id) {
        setEditingBook(null);
      }
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Reading List</h1>
        <p>Full-Stack REST API &amp; React Client</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      <StatsPanel stats={stats} />
      <FilterBar filters={filters} onChange={setFilters} />
      <BookForm
        editingBook={editingBook}
        onSubmit={handleFormSubmit}
        onCancelEdit={() => setEditingBook(null)}
        submitting={submitting}
      />
      <BookList
        books={books}
        loading={loading}
        onToggleRead={handleToggleRead}
        onRate={handleRate}
        onEdit={setEditingBook}
        onDelete={handleDelete}
        busyId={busyId}
      />
    </div>
  );
}
