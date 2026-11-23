# Reading List — Full-Stack REST API & React Client

A full-stack Reading List application built with **Node.js + Express 5** on the backend and **React + Vite** on the frontend. Data is managed immutably in server memory with strict manual input/query validation, explicit origin-restricted CORS, and a dedicated Fetch API client module.

## How to Install and Run

### 1. Start the Backend Server (`server/`)
```bash
cd server
npm install
npm run dev
```
- Runs on `http://localhost:3000` by default (`PORT=3000`).
- Restricts CORS strictly to `CLIENT_ORIGIN` (defaults to `http://localhost:5173`).

### 2. Start the Frontend Client (`client/`)
Open a second terminal:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
- Runs on `http://localhost:5173` and reads `VITE_API_URL=http://localhost:3000` from `client/.env`.

## File Organization

```text
/assignment9
 ├─ server/
 │   ├─ server.js           # Express 5 app, CORS, routes, stats, 404 & error middlewares
 │   ├─ booksStore.js       # Immutable async data access layer with 6 initial seed books
 │   ├─ validate.js         # Manual validation for book payloads, IDs, and query params
 │   ├─ package.json        # ES module config and start/dev scripts
 │   └─ package-lock.json   # Dependency lockfile
 ├─ client/
 │   ├─ src/
 │   │   ├─ api/books.js    # Centralized Fetch helper (handles 204, errors, Content-Type)
 │   │   ├─ components/     # StatsPanel, FilterBar, BookForm, BookList, BookItem
 │   │   ├─ App.jsx         # Main state, AbortController cleanup, and server error banner
 │   │   ├─ index.css       # Plain CSS styling without UI component libraries
 │   │   └─ main.jsx        # React DOM entry point
 │   ├─ .env.example        # Documents VITE_API_URL environment variable
 │   ├─ index.html          # Vite HTML entry
 │   └─ package.json        # React & Vite dependencies
 ├─ .gitignore              # Excludes node_modules/, .env, and dist/
 └─ README.md               # Documentation, curl & preflight evidence, reasoning answers
```

## Testing Evidence (`curl --include`)

### 1. `200 OK` — List with Combined Query Parameters (`GET /api/books?genre=science&sort=year&order=desc`)
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 226
ETag: W/"e2-EMed+cLRxerh3kKCGzKswaJ/dq0"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":3,"title":"A Brief History of Time","author":"Stephen Hawking","year":1988,"genre":"science","read":true,"rating":5},{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}]
```

### 2. `200 OK` — Single Book (`GET /api/books/1`)
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-imtguC0biqtv8FVKP54vGf/dVoY"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}
```

### 3. `201 Created` — Create Book with `Location` Header (`POST /api/books`)
```http
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/7
Content-Type: application/json; charset=utf-8
Content-Length: 109
ETag: W/"6d-AdrUQwZ/qFTepPo8Owfi4MivUG0"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Neuromancer","author":"William Gibson","year":1984,"genre":"science","read":true,"rating":5}
```

### 4. `400 Bad Request` — Invalid Body (`rating` sent while `read: false`)
```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 52
ETag: W/"34-tutnrkMPv75sLEC3ZfFbKik8k2U"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"rating is only allowed when read is true"}
```

### 5. `400 Bad Request` — Repeated Query Parameter (`?genre=fiction&genre=history`)
```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-a+65h+HmzMUgylh2hyrr7Y1/tk0"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Repeated query parameter is not allowed: genre"}
```

### 6. `404 Not Found` — Missing Book (`GET /api/books/999`)
```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

### 7. `409 Conflict` — Duplicate Title & Author (`POST /api/books`)
```http
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 64
ETag: W/"40-Y8ZVtnRDFrTFCmvse+K/kdGoMVg"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with the same title and author already exists"}
```

### 8. `PUT` vs `PATCH` on the Same Book (`/api/books/7`)

**Full Replacement via `PUT /api/books/7`:**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 119
ETag: W/"77-bVg5c2naWMl31b/2MSRRjj6cqyE"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Neuromancer (Revised)","author":"William Gibson","year":1984,"genre":"fiction","read":true,"rating":4}
```

**Partial Update via `PATCH /api/books/7` (only `rating` updated, other fields preserved):**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 119
ETag: W/"77-Oo0fW75oc9LO884WxYGKogpvpCo"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"Neuromancer (Revised)","author":"William Gibson","year":1984,"genre":"fiction","read":true,"rating":5}
```

### 9. `204 No Content` Delete Followed by Repeated Delete (`404 Not Found`)

**First `DELETE /api/books/7`:**
```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

**Second `DELETE /api/books/7`:**
```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

### 10. `GET /api/stats` Before and After Adding a Book

**Before `POST /api/books`:**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-TAVLMt13jxwAFB7b0bvjPvFNOSY"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":6,"read":4,"unread":2,"averageRating":4.5,"byGenre":{"science":2,"fiction":1,"fantasy":1,"history":1,"non-fiction":1}}
```

**After `POST /api/books`:**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-bp6I069Q2yiROMtUXMBctv/fW8Q"
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":7,"read":5,"unread":2,"averageRating":4.6,"byGenre":{"science":2,"fiction":2,"fantasy":1,"history":1,"non-fiction":1}}
```

### 11. CORS Preflight Evidence (`OPTIONS /api/books`)

When the browser sends a JSON `POST`, `PUT`, `PATCH`, or `DELETE` request from `http://localhost:5173` to `http://localhost:3000`, Chrome DevTools Network tab records an `OPTIONS` preflight request prior to the actual request. The server responds with `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`:

```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: Content-Type
Content-Length: 0
Date: Mon, 23 Nov 2026 12:20:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

*(Note: `GET /api/crash` is also included in `server.js` to verify that uncaught async errors are caught and passed to the four-parameter error middleware, returning `500` `{"error":"Something went wrong"}` without leaking stack traces.)*

## Reasoning Questions

1. **Parameters:** A book's `id` identifies a specific, unique resource in the REST hierarchy (`/api/books/:id`), making it a natural route parameter. In contrast, `genre` and `sort` are optional modifiers that filter or order the collection resource (`/api/books`). If `id` were placed in the query string (`/api/books?id=1`), the endpoint would semantically represent a filtered list query rather than a direct single-resource lookup, complicating RESTful semantics for `PUT`, `PATCH`, and `DELETE`.
2. **Body parsing:** When I moved `app.use(express.json())` below the route definitions, `req.body` became `undefined` inside `POST /api/books`. Consequently, my validation logic rejected the request because `body` was not an object, returning `400 Bad Request` (`{"error":"Request body must be a JSON object"}`).
3. **One response:** Removing `return` before an early `res.status(404).json(...)` caused execution to continue into the rest of the route handler, attempting to send a second response (`res.status(200).json(...)`). Node.js immediately threw `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client` in the server logs because HTTP allows only one response per request.
4. **PUT and PATCH:** `PATCH` is the better choice when toggling a book's `read` status or updating its `rating` from a list item button, because only the changed property needs to be transmitted without resending title, author, year, and genre. `PUT` is the better choice in the full Edit Book form, where the user reviews and submits a complete replacement representation of the entire book record.
5. **CORS:** Setting `CLIENT_ORIGIN=http://localhost:9999` caused the browser console to block the request with a CORS policy error (`No 'Access-Control-Allow-Origin' header is present on the requested resource` / origin mismatch). The server still received and processed the incoming request, because CORS is enforced by web browsers—not by the server or command-line tools like `curl`, which do not enforce browser Same-Origin policies.
6. **Validation:** Client-side validation improves user experience with instant feedback, but anyone can bypass the browser UI using `curl`, Postman, or modified scripts to send malformed types, out-of-range years, or unauthenticated payloads directly to the API. Server-side validation is the true security and data-integrity boundary.
7. **State:** Restarting the server erased all newly added, edited, and deleted books, resetting the collection back to the original 6 seed books. This shows that the data lives strictly in volatile RAM inside the running Node.js process; persisting data across restarts requires an external storage layer such as a relational or document database (e.g., PostgreSQL or SQLite).

## Self-Study Notes

- **Building Safe Query Strings (`URLSearchParams`):** Consulted the MDN `URLSearchParams` documentation. Using `searchParams.set(key, value)` automatically percent-encodes special characters and spaces in search queries (`q`), preventing broken URLs or parameter injection.
- **Alphabetical Sorting (`String.prototype.localeCompare`):** Reviewed MDN docs for `localeCompare()`. Unlike standard `<` / `>` relational operators that compare UTF-16 code units (placing all uppercase letters before lowercase), `a.title.localeCompare(b.title)` provides natural, case-insensitive alphabetical ordering.
- **Vite Environment Variables (`import.meta.env.VITE_*`):** Read the Vite Env Variables guide. Vite exposes only variables prefixed with `VITE_` to client-side code via `import.meta.env` so private server secrets in `.env` files are never accidentally bundled into public browser JavaScript.
- **Empty `204 No Content` Responses in Express 5:** Verified in Express 5 docs that `res.status(204).end()` sends the `204` status code with zero response body, matching HTTP specifications and allowing the client helper to skip `response.json()`.
- **Cancelling Stale Fetches (`AbortController`):** Used `new AbortController()` inside `useEffect` cleanup and passed `controller.signal` to `fetch()`. When rapid typing in the search bar cancels an in-flight request, `fetch` rejects with an `AbortError` (`err.name === "AbortError"`), which we catch and ignore so stale responses never overwrite newer results.

## Challenges Faced

- **Express 5 Sub-Router Path Matching:** Used `app.use("/api", ...)` instead of Express 4's `app.get("/api/*", ...)` for the API 404 fallback so unmatched sub-routes return JSON `404` cleanly without triggering Express 5 `path-to-regexp` errors.
- **Coupled `read` and `rating` Validation on `PATCH`:** Ensuring that setting `read: false` via `PATCH` also clears `rating` to `null` required merging partial payloads with the existing book object before running full validation.
