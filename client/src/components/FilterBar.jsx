const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

export function FilterBar({ filters, onChange }) {
  function handleField(field, value) {
    onChange({
      ...filters,
      [field]: value
    });
  }

  return (
    <section className="card filter-bar" aria-label="Search and Filter">
      <div className="filter-grid">
        <input
          type="search"
          placeholder="Search title or author..."
          value={filters.q}
          onChange={(e) => handleField("q", e.target.value)}
        />

        <select
          value={filters.genre}
          onChange={(e) => handleField("genre", e.target.value)}
          aria-label="Filter by genre"
        >
          <option value="">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={filters.read}
          onChange={(e) => handleField("read", e.target.value)}
          aria-label="Filter by read status"
        >
          <option value="">All Statuses</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => handleField("sort", e.target.value)}
          aria-label="Sort by field"
        >
          <option value="">Sort: Default (ID)</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="year">Year</option>
          <option value="rating">Rating</option>
        </select>

        <select
          value={filters.order}
          onChange={(e) => handleField("order", e.target.value)}
          aria-label="Sort direction"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </section>
  );
}
