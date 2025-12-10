import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function AdminColleges({ token }) {
  const [colleges, setColleges] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    state: "",
    city: "",
    website_url: "",
    is_partner: false,
    course_name: "",
    course_stream: "",
  });

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const loadColleges = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/colleges`);
      setColleges(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        name: form.name,
        state: form.state,
        city: form.city,
        website_url: form.website_url || null,
        is_partner: form.is_partner,
        courses: form.course_name
          ? [
              {
                name: form.course_name,
                stream: form.course_stream || null,
              },
            ]
          : [],
      };
      await axios.post(`${API_BASE}/colleges`, payload, authHeader);
      setMessage("College created.");
      setForm({
        name: "",
        state: "",
        city: "",
        website_url: "",
        is_partner: false,
        course_name: "",
        course_stream: "",
      });
      loadColleges();
    } catch (err) {
      const detail = err.response?.data?.detail || "Error creating college";
      setMessage(detail);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete college "${name}"? This cannot be undone.`)) {
      return;
    }
    setMessage("");
    try {
      await axios.delete(`${API_BASE}/colleges/${id}`, authHeader);
      setMessage("College deleted.");
      setColleges((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const detail = err.response?.data?.detail || "Error deleting college";
      setMessage(detail);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Manage colleges</h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <h4>Add new college</h4>
        <form onSubmit={handleSubmit} className="form-vertical">
          <div>
            <label>College name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Website URL (optional)</label>
            <input
              name="website_url"
              value={form.website_url}
              onChange={handleChange}
              placeholder="https://example.edu"
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="is_partner"
                checked={form.is_partner}
                onChange={handleChange}
              />{" "}
              Partner college
            </label>
          </div>

          <div>
            <label>One course (optional to start)</label>
            <input
              placeholder="Course name (e.g. BTech CSE)"
              name="course_name"
              value={form.course_name}
              onChange={handleChange}
            />
            <input
              placeholder="Stream (engineering, medical, ...)"
              name="course_stream"
              value={form.course_stream}
              onChange={handleChange}
              style={{ marginTop: 6 }}
            />
          </div>

          <button type="submit" style={{ marginTop: 8 }}>
            Save college
          </button>
        </form>
        {message && <p style={{ marginTop: 8 }}>{message}</p>}
      </div>

      {loading && <p>Loading colleges...</p>}

      <div className="card">
        <h4>Existing colleges</h4>
        {colleges.length === 0 && !loading && <p>No colleges yet.</p>}
        {colleges.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Partner</th>
                <th>Courses</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    {c.city}, {c.state}
                  </td>
                  <td>{c.is_partner ? "Yes" : "No"}</td>
                  <td>
                    {c.courses && c.courses.length > 0
                      ? c.courses.map((course) => course.name).join(", ")
                      : "—"}
                  </td>
                  <td>
                    {/* Edit can be added later */}
                    <button
                      className="btn-secondary"
                      onClick={() => handleDelete(c.id, c.name)}
                    >
                      Delete
                    </button>
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

export default AdminColleges;
