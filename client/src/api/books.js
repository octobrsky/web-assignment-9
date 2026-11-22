const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = "GET", body, signal } = {}) {
  const headers = {};
  const options = { method, headers, signal };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message = data && data.error ? data.error : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function fetchBooks(params = {}, signal) {
  const searchParams = new URLSearchParams();

  if (params.q && params.q.trim() !== "") {
    searchParams.set("q", params.q.trim());
  }
  if (params.genre) {
    searchParams.set("genre", params.genre);
  }
  if (params.read !== undefined && params.read !== "") {
    searchParams.set("read", params.read);
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.order) {
    searchParams.set("order", params.order);
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/api/books?${queryString}` : "/api/books";
  return request(path, { signal });
}

export function fetchStats(signal) {
  return request("/api/stats", { signal });
}

export function createBook(bookData) {
  return request("/api/books", { method: "POST", body: bookData });
}

export function updateBookPut(id, bookData) {
  return request(`/api/books/${id}`, { method: "PUT", body: bookData });
}

export function patchBook(id, partialData) {
  return request(`/api/books/${id}`, { method: "PATCH", body: partialData });
}

export function removeBook(id) {
  return request(`/api/books/${id}`, { method: "DELETE" });
}
