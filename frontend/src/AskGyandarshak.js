import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function AskGyandarshak() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await axios.post(`${API_BASE}/ai/ask`, { question });
      setAnswer(res.data.answer);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Error contacting assistant";
      setAnswer(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3>Ask Gyandarshak (demo)</h3>
      <p className="text-muted" style={{ marginBottom: 8 }}>
        Try simple questions about exams, colleges, or scholarships. In the
        future this will use your profile and real data.
      </p>
      <form onSubmit={handleAsk}>
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about exams, colleges, or scholarships..."
          style={{ width: "100%", resize: "vertical" }}
        />
        <button
          type="submit"
          style={{ marginTop: 8 }}
          disabled={loading || !question.trim()}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>
      {answer && (
        <p
          style={{
            marginTop: 10,
            background: "#f3f4f6",
            padding: 8,
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {answer}
        </p>
      )}
    </div>
  );
}

export default AskGyandarshak;
