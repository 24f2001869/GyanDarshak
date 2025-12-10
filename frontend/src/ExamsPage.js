import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function ExamsPage({ onBack }) {
  const [exams, setExams] = useState([]);
  const [filters, setFilters] = useState({
    year: "",
    stream: "",
    level: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadExams = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.year) params.year = filters.year;
      if (filters.stream) params.stream = filters.stream;
      if (filters.level) params.level = filters.level;

      const res = await axios.get(`${API_BASE}/exams`, { params });
      setExams(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to load exams";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadExams();
  };

  const formatDates = (dates) => {
    if (!dates || dates.length === 0) return "—";
    return dates
      .map((d) => `${d.year} ${d.event_type}: ${d.date}`)
      .join(" | ");
  };

  return (
    <div className="section">
      <div className="dashboard-header-row">
        <h2>Exams & important dates</h2>
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            Back to dashboard
          </button>
        )}
      </div>

      <p className="text-muted">
        Check major entrance exams with their levels and key dates. Use filters
        for your stream and year.
      </p>

      <form onSubmit={handleSubmit} className="filter-row">
        <div className="filter-field">
          <label>Year</label>
          <input
            placeholder="e.g. 2026"
            name="year"
            value={filters.year}
            onChange={handleChange}
          />
        </div>
        <div className="filter-field">
          <label>Stream</label>
          <input
            placeholder="engineering, medical..."
            name="stream"
            value={filters.stream}
            onChange={handleChange}
          />
        </div>
        <div className="filter-field">
          <label>Level</label>
          <input
            placeholder="national, state..."
            name="level"
            value={filters.level}
            onChange={handleChange}
          />
        </div>
        <div className="filter-actions">
          <button type="submit">Filter</button>
        </div>
      </form>

      {loading && <p>Loading exams...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && exams.length === 0 && !error && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>No exams found</h3>
          <p className="text-muted">
            Try changing the year or removing some filters. More exams will be
            added over time.
          </p>
        </div>
      )}

      {exams.length > 0 && (
        <div className="card" style={{ marginTop: 12, padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Stream</th>
                <th>Level</th>
                <th>Key dates</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td>
                    {exam.official_website ? (
                      <a
                        href={exam.official_website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {exam.name}
                      </a>
                    ) : (
                      exam.name
                    )}
                  </td>
                  <td>{exam.stream || "—"}</td>
                  <td>{exam.level || "—"}</td>
                  <td>{formatDates(exam.dates)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExamsPage;
