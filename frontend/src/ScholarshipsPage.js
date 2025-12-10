import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function ScholarshipsPage({ onBack }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    level: "",
    state: "",
    provider_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.level) params.level = filters.level;
      if (filters.state) params.state = filters.state;
      if (filters.provider_type) params.provider_type = filters.provider_type;

      const res = await axios.get(`${API_BASE}/scholarships`, { params });
      setItems(res.data);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to load scholarships";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="section">
      <div className="dashboard-header-row">
        <h2>Scholarships & support</h2>
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            Back to dashboard
          </button>
        )}
      </div>

      <p className="text-muted">
        Discover government schemes, trust-based scholarships, and other
        financial support. Filter by level, state, or provider type.
      </p>

      <form onSubmit={handleSubmit} className="filter-row">
        <div className="filter-field">
          <label>Level</label>
          <input
            placeholder="school, UG, PG"
            name="level"
            value={filters.level}
            onChange={handleChange}
          />
        </div>
        <div className="filter-field">
          <label>State (optional)</label>
          <input
            placeholder="e.g. Jharkhand"
            name="state"
            value={filters.state}
            onChange={handleChange}
          />
        </div>
        <div className="filter-field">
          <label>Provider type</label>
          <input
            placeholder="government, trust..."
            name="provider_type"
            value={filters.provider_type}
            onChange={handleChange}
          />
        </div>
        <div className="filter-actions">
          <button type="submit">Filter</button>
        </div>
      </form>

      {loading && <p>Loading scholarships...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && items.length === 0 && !error && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>No scholarships found</h3>
          <p className="text-muted">
            Try using fewer filters or a broader level. More verified schemes
            will be added over time.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="card" style={{ marginTop: 12, padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Provider</th>
                <th>Level</th>
                <th>State</th>
                <th>Last date</th>
                <th>Eligibility (short)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.application_url ? (
                      <a
                        href={s.application_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.name}
                      </a>
                    ) : (
                      s.name
                    )}
                  </td>
                  <td>{s.provider_name || s.provider_type || "—"}</td>
                  <td>{s.level || "—"}</td>
                  <td>{s.state || "All"}</td>
                  <td>{s.last_date || "—"}</td>
                  <td>
                    {s.eligibility_summary_en ||
                      "Eligibility details will be explained in counselling."}
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

export default ScholarshipsPage;
