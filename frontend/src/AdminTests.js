import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function AdminTests({ token }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([
    {
      text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      marks: 1,
    },
  ]);
  const [message, setMessage] = useState("");
  const [selectedTestId, setSelectedTestId] = useState("");
  const [results, setResults] = useState([]);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const updateQuestion = (index, field, value) => {
    const copy = [...questions];
    copy[index] = { ...copy[index], [field]: value };
    setQuestions(copy);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        marks: 1,
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        title,
        description,
        duration_minutes: Number(duration) || 30,
        questions,
      };
      await axios.post(`${API_BASE}/tests`, payload, authHeader);
      setMessage("Test created.");
      setTitle("");
      setDescription("");
      setDuration(30);
      setQuestions([
        {
          text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "A",
          marks: 1,
        },
      ]);
    } catch (err) {
      const detail = err.response?.data?.detail || "Error creating test";
      setMessage(detail);
    }
  };

  const loadResults = async () => {
    if (!selectedTestId) return;
    setMessage("");
    try {
      const res = await axios.get(
        `${API_BASE}/tests/${selectedTestId}/attempts`,
        authHeader
      );
      setResults(res.data);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to load results";
      setMessage(detail);
      setResults([]);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Manage tests</h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <h4>Create new test</h4>
        <form onSubmit={handleSubmit} className="form-vertical">
          <div>
            <label>Test title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ maxWidth: 120 }}
            />
          </div>

          <h4>Questions</h4>
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                marginTop: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "none",
              }}
            >
              <div>
                <label>Question text</label>
                <textarea
                  rows={2}
                  value={q.text}
                  onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Option A</label>
                <input
                  value={q.option_a}
                  onChange={(e) =>
                    updateQuestion(idx, "option_a", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label>Option B</label>
                <input
                  value={q.option_b}
                  onChange={(e) =>
                    updateQuestion(idx, "option_b", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label>Option C</label>
                <input
                  value={q.option_c}
                  onChange={(e) =>
                    updateQuestion(idx, "option_c", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label>Option D</label>
                <input
                  value={q.option_d}
                  onChange={(e) =>
                    updateQuestion(idx, "option_d", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label>Correct option (A/B/C/D)</label>
                <input
                  value={q.correct_option}
                  onChange={(e) =>
                    updateQuestion(
                      idx,
                      "correct_option",
                      e.target.value.toUpperCase()
                    )
                  }
                  maxLength={1}
                  style={{ maxWidth: 60 }}
                />
              </div>
              <div>
                <label>Marks</label>
                <input
                  type="number"
                  value={q.marks}
                  onChange={(e) =>
                    updateQuestion(
                      idx,
                      "marks",
                      Number(e.target.value) || 1
                    )
                  }
                  style={{ maxWidth: 80 }}
                />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={addQuestion}
              style={{ marginRight: 8 }}
            >
              + Add another question
            </button>
            <button type="submit">Save test</button>
          </div>
        </form>
        {message && <p style={{ marginTop: 8 }}>{message}</p>}
      </div>

      <div className="card">
        <h4>View test results</h4>
        <div className="form-inline">
          <div>
            <label>Test ID</label>
            <input
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              placeholder="e.g. 1"
              style={{ maxWidth: 120 }}
            />
          </div>
          <button type="button" onClick={loadResults}>
            Load results
          </button>
        </div>

        {results.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Started</th>
                  <th>Finished</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.attempt_id}>
                    <td>{r.student_name || "Student"}</td>
                    <td>
                      {r.score !== null
                        ? `${r.score}/${r.total_marks}`
                        : "—"}
                    </td>
                    <td>
                      {r.started_at
                        ? new Date(r.started_at).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {r.finished_at
                        ? new Date(r.finished_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {results.length === 0 && selectedTestId && (
          <p style={{ marginTop: 8 }}>No attempts found for this test yet.</p>
        )}
      </div>
    </div>
  );
}

export default AdminTests;
