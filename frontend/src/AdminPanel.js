import React, { useState } from "react";
import AdminColleges from "./AdminColleges";
import AdminExams from "./AdminExams";
import AdminScholarships from "./AdminScholarships";
import AdminTests from "./AdminTests";
import AdminSessions from "./AdminSessions";

function AdminPanel({ token, onBack }) {
  const [tab, setTab] = useState("colleges"); // colleges | exams | scholarships | tests | sessions

  const tabs = [
    { id: "colleges", label: "Colleges" },
    { id: "exams", label: "Exams" },
    { id: "scholarships", label: "Scholarships" },
    { id: "tests", label: "Tests" },
    { id: "sessions", label: "Sessions" },
  ];

  return (
    <div className="section">
      <div className="dashboard-header-row">
        <h2>Admin Panel – Gyandarshak</h2>
        <button className="btn-secondary" onClick={onBack}>
          Back to dashboard
        </button>
      </div>

      <p className="text-muted">
        Manage core data for colleges, exams, scholarships, tests and counselling
        sessions.
      </p>

      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={
              "admin-tab-btn" + (tab === t.id ? " admin-tab-btn--active" : "")
            }
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "colleges" && <AdminColleges token={token} />}
      {tab === "exams" && <AdminExams token={token} />}
      {tab === "scholarships" && <AdminScholarships token={token} />}
      {tab === "tests" && <AdminTests token={token} />}
      {tab === "sessions" && <AdminSessions token={token} />}
    </div>
  );
}

export default AdminPanel;
