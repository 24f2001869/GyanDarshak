import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function AdminSessions({ token }) {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.get(`${API_BASE}/sessions`, authHeader);
      setItems(res.data);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to load session requests";
      setMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.post(
        `${API_BASE}/sessions/${id}/status`,
        null,
        { ...authHeader, params: { status } }
      );
      load();
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to update status";
      setMsg(detail);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Counselling session requests</h3>
      {loading && <p>Loading...</p>}
      {msg && <p className="error-text">{msg}</p>}
      {items.length === 0 && !loading && <p>No requests yet.</p>}

      {items.length > 0 && (
        <div className="card" style={{ marginTop: 8, padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Date / time</th>
                <th>Mode</th>
                <th>Note</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.student_id || "-"}</td>
                  <td>
                    {r.preferred_date} {r.preferred_time || ""}
                  </td>
                  <td>{r.mode || "-"}</td>
                  <td>{r.note || "-"}</td>
                  <td>{r.status}</td>
                  <td>
                    <button onClick={() => updateStatus(r.id, "approved")}>
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, "rejected")}
                      className="btn-secondary"
                      style={{ marginLeft: 4 }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, "done")}
                      className="btn-secondary"
                      style={{ marginLeft: 4 }}
                    >
                      Done
                    </button>
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

export default AdminSessions;
