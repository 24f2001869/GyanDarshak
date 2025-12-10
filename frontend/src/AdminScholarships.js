import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function AdminScholarships({ token }) {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    provider_type: "",
    provider_name: "",
    level: "",
    state: "",
    last_date: "",
  });

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const load = async () => {
    try {
      const res = await axios.get(`${API_BASE}/scholarships`);
      setItems(res.data);
    } catch {
      setMsg("Failed to load scholarships");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        name: form.name,
        provider_type: form.provider_type || null,
        provider_name: form.provider_name || null,
        level: form.level || null,
        min_class_or_course: null,
        eligibility_summary_en: null,
        eligibility_summary_hi: null,
        amount_description: null,
        application_url: null,
        state: form.state || null,
        last_date: form.last_date || null,
      };
      await axios.post(`${API_BASE}/scholarships`, payload, authHeader);
      setMsg("Scholarship created");
      setForm({
        name: "",
        provider_type: "",
        provider_name: "",
        level: "",
        state: "",
        last_date: "",
      });
      load();
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Error creating scholarship";
      setMsg(detail);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete scholarship "${name}"? This cannot be undone.`)) {
      return;
    }
    setMsg("");
    try {
      await axios.delete(`${API_BASE}/scholarships/${id}`, authHeader);
      setMsg("Scholarship deleted");
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Error deleting scholarship";
      setMsg(detail);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Manage scholarships</h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <h4>Add new scholarship</h4>
        <form onSubmit={handleSubmit} className="form-vertical">
          <div>
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Provider type (government / trust / private)</label>
            <input
              name="provider_type"
              value={form.provider_type}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Provider name (NSP, specific trust, etc.)</label>
            <input
              name="provider_name"
              value={form.provider_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Level (school / UG / PG)</label>
            <input
              name="level"
              value={form.level}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>State (blank if national)</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Last date (optional)</label>
            <input
              type="date"
              name="last_date"
              value={form.last_date}
              onChange={handleChange}
            />
          </div>
          <button type="submit" style={{ marginTop: 8 }}>
            Save scholarship
          </button>
        </form>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </div>

      <div className="card">
        <h4>Existing scholarships</h4>
        {items.length === 0 && <p>No scholarships yet.</p>}
        {items.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Provider</th>
                <th>Level</th>
                <th>State</th>
                <th>Last date</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.provider_name || s.provider_type || "—"}</td>
                  <td>{s.level || "—"}</td>
                  <td>{s.state || "All India"}</td>
                  <td>{s.last_date || "—"}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDelete(s.id, s.name)}
                    >
                      Delete
                    </button>
                    {/* Edit can be added later */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminScholarships;
