export const VALID_GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];
const ALLOWED_QUERY_KEYS = ["genre", "read", "q", "sort", "order", "limit", "page"];
const VALID_SORT_FIELDS = ["title", "author", "year", "rating"];
const VALID_ORDERS = ["asc", "desc"];

export function parsePositiveId(rawId) {
  if (!/^[1-9]\d*$/.test(String(rawId))) {
    return null;
  }
  const num = Number(rawId);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

export function validateBookPayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  if (typeof body.title !== "string") {
    return { error: "title is required and must be a string" };
  }
  const title = body.title.trim();
  if (title.length < 1 || title.length > 100) {
    return { error: "title must be between 1 and 100 characters" };
  }

  if (typeof body.author !== "string") {
    return { error: "author is required and must be a string" };
  }
  const author = body.author.trim();
  if (author.length < 1 || author.length > 100) {
    return { error: "author must be between 1 and 100 characters" };
  }

  const currentYear = new Date().getFullYear();
  if (typeof body.year !== "number" || !Number.isInteger(body.year) || body.year < 1000 || body.year > currentYear) {
    return { error: `year must be an integer between 1000 and ${currentYear}` };
  }

  if (typeof body.genre !== "string" || !VALID_GENRES.includes(body.genre)) {
    return { error: `genre must be one of: ${VALID_GENRES.join(", ")}` };
  }

  const read = body.read === undefined ? false : body.read;
  if (typeof read !== "boolean") {
    return { error: "read must be a boolean" };
  }

  const rating = body.rating === undefined ? null : body.rating;
  if (rating !== null) {
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { error: "rating must be an integer between 1 and 5, or null" };
    }
    if (!read) {
      return { error: "rating is only allowed when read is true" };
    }
  }

  return {
    value: {
      title,
      author,
      year: body.year,
      genre: body.genre,
      read,
      rating
    }
  };
}

export function validateQueryParams(query) {
  for (const [key, val] of Object.entries(query)) {
    if (!ALLOWED_QUERY_KEYS.includes(key)) {
      return { error: `Unknown query parameter: ${key}` };
    }
    if (Array.isArray(val)) {
      return { error: `Repeated query parameter is not allowed: ${key}` };
    }
  }

  const filters = {
    genre: null,
    read: null,
    q: null,
    sort: null,
    order: "asc",
    limit: 50,
    page: 1
  };

  if (query.genre !== undefined) {
    if (!VALID_GENRES.includes(query.genre)) {
      return { error: `Invalid genre. Must be one of: ${VALID_GENRES.join(", ")}` };
    }
    filters.genre = query.genre;
  }

  if (query.read !== undefined) {
    if (query.read !== "true" && query.read !== "false") {
      return { error: "read must be 'true' or 'false'" };
    }
    filters.read = query.read === "true";
  }

  if (query.q !== undefined) {
    if (typeof query.q !== "string") {
      return { error: "q must be a string" };
    }
    filters.q = query.q.trim().toLowerCase();
  }

  if (query.sort !== undefined) {
    if (!VALID_SORT_FIELDS.includes(query.sort)) {
      return { error: `sort must be one of: ${VALID_SORT_FIELDS.join(", ")}` };
    }
    filters.sort = query.sort;
  }

  if (query.order !== undefined) {
    if (!VALID_ORDERS.includes(query.order)) {
      return { error: "order must be 'asc' or 'desc'" };
    }
    filters.order = query.order;
  }

  if (query.limit !== undefined) {
    if (!/^[1-9]\d*$/.test(query.limit)) {
      return { error: "limit must be an integer between 1 and 50" };
    }
    const limitNum = Number(query.limit);
    if (limitNum < 1 || limitNum > 50) {
      return { error: "limit must be an integer between 1 and 50" };
    }
    filters.limit = limitNum;
  }

  if (query.page !== undefined) {
    if (!/^[1-9]\d*$/.test(query.page)) {
      return { error: "page must be a positive integer" };
    }
    filters.page = Number(query.page);
  }

  return { value: filters };
}
