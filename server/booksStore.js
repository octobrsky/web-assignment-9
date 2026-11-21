const INITIAL_BOOKS = [
  { id: 1, title: "Dune", author: "Frank Herbert", year: 1965, genre: "science", read: true, rating: 5 },
  { id: 2, title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", year: 1969, genre: "fiction", read: true, rating: 4 },
  { id: 3, title: "A Brief History of Time", author: "Stephen Hawking", year: 1988, genre: "science", read: true, rating: 5 },
  { id: 4, title: "The Name of the Wind", author: "Patrick Rothfuss", year: 2007, genre: "fantasy", read: false, rating: null },
  { id: 5, title: "Sapiens", author: "Yuval Noah Harari", year: 2011, genre: "history", read: true, rating: 4 },
  { id: 6, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", year: 2011, genre: "non-fiction", read: false, rating: null }
];

let books = INITIAL_BOOKS.map((book) => ({ ...book }));
let nextId = 7;

const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, 15));

export async function getAllBooks() {
  await simulateLatency();
  return books.map((book) => ({ ...book }));
}

export async function getBookById(id) {
  await simulateLatency();
  const found = books.find((book) => book.id === id);
  return found ? { ...found } : null;
}

export async function hasDuplicate(title, author, excludeId = null) {
  await simulateLatency();
  const normTitle = title.trim().toLowerCase();
  const normAuthor = author.trim().toLowerCase();
  return books.some(
    (b) =>
      b.id !== excludeId &&
      b.title.trim().toLowerCase() === normTitle &&
      b.author.trim().toLowerCase() === normAuthor
  );
}

export async function createBook(data) {
  await simulateLatency();
  const newBook = {
    id: nextId++,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    read: data.read,
    rating: data.rating
  };
  books = [...books, newBook];
  return { ...newBook };
}

export async function replaceBook(id, data) {
  await simulateLatency();
  const exists = books.some((b) => b.id === id);
  if (!exists) return null;

  const updated = {
    id,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    read: data.read,
    rating: data.rating
  };
  books = books.map((b) => (b.id === id ? updated : b));
  return { ...updated };
}

export async function deleteBook(id) {
  await simulateLatency();
  const exists = books.some((b) => b.id === id);
  if (!exists) return false;

  books = books.filter((b) => b.id !== id);
  return true;
}
