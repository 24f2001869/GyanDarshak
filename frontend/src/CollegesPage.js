import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function CollegesPage({ onBack }) {
  const [colleges, setColleges] = useState([]);
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    stream: "",
    q: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadColleges = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.state) params.state = filters.state;
      if (filters.city) params.city = filters.city;
      if (filters.stream) params.stream = filters.stream;
      if (filters.q) params.q = filters.q;

      const res = await axios.get(`${API_BASE}/colleges`, { params });
      setColleges(res.data);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to load colleges";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadColleges();
  };

  return (
    <div className="section">
      <div className="dashboard-header-row">
        <h2>Colleges</h2>
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            Back to dashboard
          </button>
        )}
      </div>

      <p className="text-muted">
        Browse colleges and basic course info. Use filters to narrow by state,
        city, or stream.
      </p>

      <form onSubmit={handleSubmit} className="filter-row">
        <div className="filter-field">
          <label>Search</label>
          <input
            placeholder="Name or keyword"
            name="q"
            value={filters.q}
            onChange={handleChange}
          />
        </div>
        <div className="filter-field">
          <label>State</label>
          <input
            placeholder="e.g. Jharkhand"
            name="state"
            value={filters.state}
            onChange={handleChange}
          />
        </div>
        <div className="filter-field">
          <label>City</label>
          <input
            placeholder="e.g. Ranchi"
            name="city"
            value={filters.city}
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
        <div className="filter-actions">
          <button type="submit">Filter</button>
        </div>
      </form>

      {loading && <p>Loading colleges...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && colleges.length === 0 && !error && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>No colleges found</h3>
          <p className="text-muted">
            Try removing some filters or searching with a different keyword.
          </p>
        </div>
      )}

      {colleges.length > 0 && (
        <div className="card" style={{ marginTop: 12, padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>State</th>
                <th>Partner</th>
                <th>Courses</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.website_url ? (
                      <a
                        href={c.website_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </td>
                  <td>{c.city}</td>
                  <td>{c.state}</td>
                  <td>
                    {c.is_partner ? (
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>
                        Partner
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {c.courses && c.courses.length > 0
                      ? c.courses.map((course) => course.name).join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CollegesPage;
