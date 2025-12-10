import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE = "http://127.0.0.1:8000";

function MyTestHistory({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.get(`${API_BASE}/tests/my-attempts`, authHeader);
      setItems(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to load history";
      setMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>My test history</h3>
      {loading && <p>Loading...</p>}
      {msg && <p className="error-text">{msg}</p>}
      {items.length === 0 && !loading && <p>No attempts yet.</p>}
      {items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Started</th>
              <th>Finished</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.attempt_id}>
                <td>{a.test_title}</td>
                <td>
                  {a.score !== null
                    ? `${a.score}/${a.total_marks}`
                    : "Not evaluated"}
                </td>
                <td>
                  {a.started_at
                    ? new Date(a.started_at).toLocaleString()
                    : "—"}
                </td>
                <td>
                  {a.finished_at
                    ? new Date(a.finished_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TestsPage({ token, onBack }) {
  const { t } = useTranslation();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeAttempt, setActiveAttempt] = useState(null); // { attempt_id, test }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadTests = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(`${API_BASE}/tests`, authHeader);
      setTests(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to load tests";
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTest = async (testId) => {
    setMessage("");
    try {
      const res = await axios.post(
        `${API_BASE}/tests/${testId}/start`,
        {},
        authHeader
      );
      setActiveAttempt(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Could not start test";
      setMessage(detail);
    }
  };

  if (activeAttempt) {
    return (
      <TestTakingView
        token={token}
        attempt={activeAttempt}
        onExit={() => setActiveAttempt(null)}
      />
    );
  }

  return (
    <div className="section">
      <div className="dashboard-header-row">
        <h2>{t("tests.title", "Online tests")}</h2>
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            Back to dashboard
          </button>
        )}
      </div>

      <p className="text-muted">
        Practice tests to understand your strengths and weaknesses. Your
        counsellor can use these scores during sessions.
      </p>

      {loading && <p>Loading tests...</p>}
      {message && <p className="error-text">{message}</p>}
      {!loading && tests.length === 0 && !message && (
        <div className="card">
          <h3>No tests available yet</h3>
          <p className="text-muted">
            Tests will appear here once Gyandarshak adds them for your class and
            stream.
          </p>
        </div>
      )}

      {tests.length > 0 && (
        <div className="card" style={{ marginTop: 12, padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Description</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.duration_minutes} min</td>
                  <td>{t.total_marks}</td>
                  <td style={{ fontSize: 13 }}>{t.description || "—"}</td>
                  <td>
                    <button onClick={() => startTest(t.id)}>Start test</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MyTestHistory token={token} />
    </div>
  );
}

function TestTakingView({ token, attempt, onExit }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const test = attempt.test;

  const handleChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        answers: Object.entries(answers).map(([qid, opt]) => ({
          question_id: Number(qid),
          selected_option: opt,
        })),
      };
      const res = await axios.post(
        `${API_BASE}/tests/attempts/${attempt.attempt_id}/submit`,
        payload,
        authHeader
      );
      setResult(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Error submitting test";
      setMessage(detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="section">
        <div className="card">
          <h2>{test.title} – Result</h2>
          <p>
            Score: {result.score} / {result.total_marks}
          </p>
          <button onClick={onExit}>Back to tests</button>
        </div>
        <MyTestHistory token={token} />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="card">
        <h2>{test.title}</h2>
        <p className="text-muted">
          Duration: {test.duration_minutes} minutes • Total marks:{" "}
          {test.total_marks}
        </p>
        {message && <p className="error-text">{message}</p>}

        {test.questions.map((q, idx) => (
          <div
            key={q.id}
            className="card"
            style={{
              marginTop: 10,
              border: "1px solid #e5e7eb",
              boxShadow: "none",
            }}
          >
            <p>
              <strong>Q{idx + 1}.</strong> {q.text}
            </p>
            {["A", "B", "C", "D"].map((opt) => {
              const text =
                opt === "A"
                  ? q.option_a
                  : opt === "B"
                  ? q.option_b
                  : opt === "C"
                  ? q.option_c
                  : q.option_d;
              return (
                <label key={opt} style={{ display: "block", marginTop: 2 }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleChange(q.id, opt)}
                  />{" "}
                  {opt}. {text}
                </label>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: 12 }}>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit test"}
          </button>
          <button
            onClick={onExit}
            className="btn-secondary"
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestsPage;
