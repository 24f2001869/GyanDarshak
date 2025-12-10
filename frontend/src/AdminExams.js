import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function AdminExams({ token }) {
  const [exams, setExams] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    stream: "",
    level: "",
  });

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadExams = async () => {
    try {
      const res = await axios.get(`${API_BASE}/exams`);
      setExams(res.data);
    } catch {
      setMsg("Failed to load exams");
    }
  };

  useEffect(() => {
    loadExams();
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
        stream: form.stream || null,
        level: form.level || null,
        official_website: null,
        description_en: null,
        description_hi: null,
        dates: [],
      };
      await axios.post(`${API_BASE}/exams`, payload, authHeader);
      setMsg("Exam created");
      setForm({ name: "", stream: "", level: "" });
      loadExams();
    } catch (err) {
      const detail = err.response?.data?.detail || "Error creating exam";
      setMsg(detail);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete exam "${name}"? This cannot be undone.`)) {
      return;
    }
    setMsg("");
    try {
      await axios.delete(`${API_BASE}/exams/${id}`, authHeader);
      setMsg("Exam deleted");
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      const detail = err.response?.data?.detail || "Error deleting exam";
      setMsg(detail);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Manage exams</h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <h4>Add new exam</h4>
        <form onSubmit={handleSubmit} className="form-vertical">
          <div>
            <label>Exam name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Stream (engineering / medical / law ...)</label>
            <input
              name="stream"
              value={form.stream}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Level (national / state)</label>
            <input
              name="level"
              value={form.level}
              onChange={handleChange}
            />
          </div>
          <button type="submit" style={{ marginTop: 8 }}>
            Save exam
          </button>
        </form>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </div>

      <div className="card">
        <h4>Existing exams</h4>
        {exams.length === 0 && <p>No exams yet.</p>}
        {exams.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Stream</th>
                <th>Level</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.stream || "—"}</td>
                  <td>{e.level || "—"}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDelete(e.id, e.name)}
                    >
                      Delete
                    </button>
                    {/* Edit will be added later */}
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

export default AdminExams;
