export function StatsPanel({ stats }) {
  if (!stats) return null;

  const genreEntries = Object.entries(stats.byGenre || {});

  return (
    <section className="card stats-panel" aria-label="Reading Statistics">
      <h2>Library Statistics</h2>
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Total Books</span>
          <strong className="stat-value">{stats.total}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-label">Read</span>
          <strong className="stat-value">{stats.read}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-label">Unread</span>
          <strong className="stat-value">{stats.unread}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-label">Average Rating</span>
          <strong className="stat-value">
            {stats.averageRating !== null ? `${stats.averageRating} / 5` : "N/A"}
          </strong>
        </div>
      </div>

      {genreEntries.length > 0 && (
        <div className="genre-tags">
          {genreEntries.map(([genre, count]) => (
            <span key={genre} className="tag">
              {genre}: <strong>{count}</strong>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
