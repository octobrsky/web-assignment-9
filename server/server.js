import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  hasDuplicate,
  createBook,
  replaceBook,
  deleteBook
} from "./booksStore.js";
import {
  parsePositiveId,
  validateBookPayload,
  validateQueryParams
} from "./validate.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(express.json());

// Handle malformed JSON syntax errors cleanly with JSON 400
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }
  return next(err);
});

app.get("/api/books", async (req, res, next) => {
  try {
    const parsedQuery = validateQueryParams(req.query);
    if (parsedQuery.error) {
      return res.status(400).json({ error: parsedQuery.error });
    }

    const { genre, read, q, sort, order, limit, page } = parsedQuery.value;
    let result = await getAllBooks();

    if (genre !== null) {
      result = result.filter((b) => b.genre === genre);
    }
    if (read !== null) {
      result = result.filter((b) => b.read === read);
    }
    if (q) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    const dir = order === "desc" ? -1 : 1;

    if (sort === null) {
      sorted.sort((a, b) => (a.id - b.id) * dir);
    } else if (sort === "title" || sort === "author") {
      sorted.sort((a, b) => a[sort].localeCompare(b[sort]) * dir);
    } else if (sort === "year") {
      sorted.sort((a, b) => (a.year - b.year) * dir);
    } else if (sort === "rating") {
      sorted.sort((a, b) => {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return (a.rating - b.rating) * dir;
      });
    }

    const startIndex = (page - 1) * limit;
    const paginated = sorted.slice(startIndex, startIndex + limit);

    return res.status(200).json(paginated);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }

    const book = await getBookById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (err) {
    return next(err);
  }
});

app.post("/api/books", async (req, res, next) => {
  try {
    const validated = validateBookPayload(req.body);
    if (validated.error) {
      return res.status(400).json({ error: validated.error });
    }

    const duplicate = await hasDuplicate(validated.value.title, validated.value.author);
    if (duplicate) {
      return res.status(409).json({ error: "A book with the same title and author already exists" });
    }

    const created = await createBook(validated.value);
    return res
      .status(201)
      .location(`/api/books/${created.id}`)
      .json(created);
  } catch (err) {
    return next(err);
  }
});

app.put("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }

    const validated = validateBookPayload(req.body);
    if (validated.error) {
      return res.status(400).json({ error: validated.error });
    }

    const existing = await getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    const duplicate = await hasDuplicate(validated.value.title, validated.value.author, id);
    if (duplicate) {
      return res.status(409).json({ error: "A book with the same title and author already exists" });
    }

    const replaced = await replaceBook(id, validated.value);
    return res.status(200).json(replaced);
  } catch (err) {
    return next(err);
  }
});

app.patch("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object" });
    }

    const existing = await getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    const allowedFields = ["title", "author", "year", "genre", "read", "rating"];
    const merged = { ...existing };
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        merged[field] = req.body[field];
      }
    }

    const validated = validateBookPayload(merged);
    if (validated.error) {
      return res.status(400).json({ error: validated.error });
    }

    const duplicate = await hasDuplicate(validated.value.title, validated.value.author, id);
    if (duplicate) {
      return res.status(409).json({ error: "A book with the same title and author already exists" });
    }

    const updated = await replaceBook(id, validated.value);
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

app.delete("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }

    const deleted = await deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

app.get("/api/stats", async (req, res, next) => {
  try {
    const all = await getAllBooks();
    const total = all.length;
    const read = all.filter((b) => b.read).length;
    const unread = total - read;

    const ratedBooks = all.filter((b) => b.rating !== null);
    const averageRating =
      ratedBooks.length > 0
        ? Number((ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1))
        : null;

    const byGenre = {};
    for (const book of all) {
      byGenre[book.genre] = (byGenre[book.genre] || 0) + 1;
    }

    return res.status(200).json({
      total,
      read,
      unread,
      averageRating,
      byGenre
    });
  } catch (err) {
    return next(err);
  }
});

// Deliberate async error route to verify error middleware (documented in README)
app.get("/api/crash", async (req, res, next) => {
  try {
    throw new Error("Simulated async failure");
  } catch (err) {
    return next(err);
  }
});

// Express 5 compliant 404 fallback under /api
app.use("/api", (req, res) => {
  return res.status(404).json({ error: "Not found" });
});

// Four-parameter error-handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (CORS origin: ${CLIENT_ORIGIN})`);
});
