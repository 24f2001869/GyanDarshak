import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import CollegesPage from "./CollegesPage";
import ExamsPage from "./ExamsPage";
import ScholarshipsPage from "./ScholarshipsPage";
import AdminPanel from "./AdminPanel";
import { useTranslation } from "react-i18next";
import AskGyandarshak from "./AskGyandarshak";
import HomePage from "./HomePage";
import TestsPage from "./TestsPage";
import logo from "./gd_logo+tag.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const { i18n } = useTranslation();
  const changeLang = (lng) => i18n.changeLanguage(lng);

  const [view, setView] = useState("home"); // home | login | register | dashboard | ...
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const handleLoginSuccess = async (tkn) => {
    setToken(tkn);
    try {
      const res = await axios.get(`${API_BASE}/students/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      setUserInfo(res.data);
    } catch (e) {
      console.error(e);
    }
    setView("dashboard");
  };

  const handleLogout = () => {
    setToken("");
    setUserInfo(null);
    setView("login");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-left" onClick={() => setView("home")}>
          <img src={logo} alt="Gyandarshak logo" className="app-logo" />
          <span className="app-title">Gyandarshak</span>
        </div>

        {token && (
          <nav className="app-nav">
            <button className="btn-link" onClick={() => setView("dashboard")}>
              Dashboard
            </button>
            <button className="btn-link" onClick={() => setView("colleges")}>
              Colleges
            </button>
            <button className="btn-link" onClick={() => setView("exams")}>
              Exams
            </button>
            <button
              className="btn-link"
              onClick={() => setView("scholarships")}
            >
              Scholarships
            </button>
            <button className="btn-link" onClick={() => setView("tests")}>
              Tests
            </button>
          </nav>
        )}

        <div className="app-header-right">
          <button className="btn-secondary" onClick={() => changeLang("en")}>
            EN
          </button>
          <button
            className="btn-secondary"
            onClick={() => changeLang("hi")}
            style={{ marginLeft: 8 }}
          >
            HI
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === "home" && (
          <HomePage
            onLogin={() => setView("login")}
            onRegister={() => setView("register")}
          />
        )}

        {view === "register" && (
          <RegisterForm onSwitchToLogin={() => setView("login")} />
        )}

        {view === "login" && (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setView("register")}
          />
        )}

        {view === "dashboard" && (
          <Dashboard
            token={token}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            onLogout={handleLogout}
            onGoColleges={() => setView("colleges")}
            onGoExams={() => setView("exams")}
            onGoScholarships={() => setView("scholarships")}
            onGoAdmin={() => setView("admin")}
            onGoTests={() => setView("tests")}
          />
        )}

        {view === "admin" && (
          <AdminPanel token={token} onBack={() => setView("dashboard")} />
        )}

        {view === "tests" && (
          <TestsPage token={token} onBack={() => setView("dashboard")} />
        )}

        {view === "colleges" && (
          <CollegesPage onBack={() => setView("dashboard")} />
        )}
        {view === "exams" && (
          <ExamsPage onBack={() => setView("dashboard")} />
        )}
        {view === "scholarships" && (
          <ScholarshipsPage onBack={() => setView("dashboard")} />
        )}
      </main>
    </div>
  );
}

/* ---------- Auth forms ---------- */

function RegisterForm({ onSwitchToLogin }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "Full name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = "Password should be at least 6 characters.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      await axios.post(`${API_BASE}/auth/register`, form);
      setMessage("Registration successful. Please login.");
      setForm({ full_name: "", email: "", phone: "", password: "" });
      setErrors({});
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Could not register. Please try again.";
      setMessage(detail);
    }
  };

  return (
    <div className="card">
      <h2>{t("auth.registerTitle")}</h2>
      <form onSubmit={handleSubmit} className="form-vertical">
        <div>
          <label>{t("auth.fullName")}</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />
          {errors.full_name && (
            <p className="error-text">{errors.full_name}</p>
          )}
        </div>
        <div>
          <label>{t("auth.email")}</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label>{t("auth.phone")}</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>{t("auth.password")}</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="error-text">{errors.password}</p>
          )}
        </div>
        <button type="submit">{t("auth.register")}</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Already have an account?{" "}
        <button
          type="button"
          className="btn-secondary"
          onClick={onSwitchToLogin}
        >
          Login
        </button>
      </p>
    </div>
  );
}

function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      params.append("grant_type", "password");

      const res = await axios.post(`${API_BASE}/auth/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setErrors({});
      onLoginSuccess(res.data.access_token);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "Login failed. Please check your details and try again.";
      setMessage(detail);
    }
  };

  return (
    <div className="card">
      <h2>{t("auth.loginTitle")}</h2>
      <form onSubmit={handleSubmit} className="form-vertical">
        <div>
          <label>{t("auth.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label>{t("auth.password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
          />
          {errors.password && (
            <p className="error-text">{errors.password}</p>
          )}
        </div>
        <button type="submit">{t("auth.login")}</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        New here?{" "}
        <button
          type="button"
          className="btn-secondary"
          onClick={onSwitchToRegister}
        >
          Create an account
        </button>
      </p>
    </div>
  );
}

/* ---------- Dashboard and session booking ---------- */

function Dashboard({
  token,
  userInfo,
  setUserInfo,
  onLogout,
  onGoColleges,
  onGoExams,
  onGoScholarships,
  onGoAdmin,
  onGoTests,
}) {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: userInfo?.full_name || "",
    state: userInfo?.profile?.state || "",
    district: userInfo?.profile?.district || "",
    class_level: userInfo?.profile?.class_level || "",
    stream_interest: userInfo?.profile?.stream_interest || "",
  });

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/students/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(res.data);
      setEditForm({
        full_name: res.data.full_name || "",
        state: res.data.profile?.state || "",
        district: res.data.profile?.district || "",
        class_level: res.data.profile?.class_level || "",
        stream_interest: res.data.profile?.stream_interest || "",
      });
      setError("");
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to load profile";
      setError(detail);
    }
  };

  useEffect(() => {
    if (userInfo) {
      setEditForm({
        full_name: userInfo.full_name || "",
        state: userInfo.profile?.state || "",
        district: userInfo.profile?.district || "",
        class_level: userInfo.profile?.class_level || "",
        stream_interest: userInfo.profile?.stream_interest || "",
      });
    }
  }, [userInfo]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: editForm.full_name,
        state: editForm.state,
        district: editForm.district,
        class_level: editForm.class_level,
        stream_interest: editForm.stream_interest,
      };
      const res = await axios.patch(`${API_BASE}/students/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(res.data);
      setEditing(false);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Could not update profile";
      setError(detail);
    }
  };

  const name = userInfo?.full_name || "Student";
  const district = userInfo?.profile?.district || "—";
  const state = userInfo?.profile?.state || "—";
  const classLevel = userInfo?.profile?.class_level || "—";
  const stream = userInfo?.profile?.stream_interest || "—";

  const getInitials = (fullName) => {
    if (!fullName) return "ST";
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div>
      <div className="dashboard-header-row">
        <h2>{t("dashboard.title")}</h2>
        <button className="btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="dashboard-grid-top">
        <div className="card">
          <div className="profile-header-row">
            <div className="profile-avatar">{getInitials(name)}</div>
            <div>
              <h3 style={{ margin: 0 }}>My profile</h3>
              <div className="profile-avatar-small-text">{name}</div>
            </div>
          </div>

          {!editing && (
            <>
              <p>
                <strong>Name:</strong> {name}
              </p>
              <p>
                <strong>Class:</strong> {classLevel}
              </p>
              <p>
                <strong>Stream:</strong> {stream}
              </p>
              <p>
                <strong>Location:</strong> {district}, {state}
              </p>
              {(classLevel === "—" || stream === "—") && (
                <p className="text-muted" style={{ marginTop: 4 }}>
                  Add your class, stream and location so Gyandarshak can show
                  better colleges, exams and scholarships for you.
                </p>
              )}
              <button onClick={() => setEditing(true)} style={{ marginTop: 8 }}>
                Edit profile
              </button>
              <button
                onClick={loadProfile}
                className="btn-secondary"
                style={{ marginTop: 8, marginLeft: 8 }}
              >
                Refresh
              </button>
            </>
          )}

          {editing && (
            <form onSubmit={saveProfile} className="form-vertical">
              <div>
                <label>Name</label>
                <input
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label>Class</label>
                <select
                  name="class_level"
                  value={editForm.class_level}
                  onChange={handleEditChange}
                >
                  <option value="">Select</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label>Stream</label>
                <select
                  name="stream_interest"
                  value={editForm.stream_interest}
                  onChange={handleEditChange}
                >
                  <option value="">Select</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label>State</label>
                <input
                  name="state"
                  value={editForm.state}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label>District</label>
                <input
                  name="district"
                  value={editForm.district}
                  onChange={handleEditChange}
                />
              </div>
              <button type="submit" style={{ marginTop: 8 }}>
                Save
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: 8, marginLeft: 8 }}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <button
            onClick={onGoColleges}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            {t("dashboard.viewColleges")}
          </button>
          <button
            onClick={onGoExams}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            {t("dashboard.viewExams")}
          </button>
          <button
            onClick={onGoTests}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            Online tests
          </button>
          <button
            onClick={onGoScholarships}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            {t("dashboard.viewScholarships")}
          </button>
          {userInfo?.role === "admin" && (
            <button
              onClick={onGoAdmin}
              style={{ display: "block", width: "100%" }}
            >
              {t("dashboard.adminPanel")}
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-grid-bottom">
        <div className="card">
          <h3>What should I do next?</h3>
          <p>
            Start by checking nearby colleges and key exams for your class.
            After that, you can request a free counselling session.
          </p>
          <button
            onClick={onGoColleges}
            style={{ display: "block", marginBottom: 6, width: "100%" }}
          >
            View colleges
          </button>
          <button
            onClick={onGoExams}
            style={{ display: "block", marginBottom: 6, width: "100%" }}
          >
            View exams
          </button>
          <button
            onClick={onGoScholarships}
            style={{ display: "block", marginBottom: 6, width: "100%" }}
          >
            View scholarships
          </button>
        </div>

        <SessionBooking token={token} />

        <div className="card">
          <h3>Upcoming exams</h3>
          <p>
            Later this will show key exams and last dates based on your class
            and stream.
          </p>
        </div>

        <div className="card">
          <h3>New scholarships</h3>
          <p>
            Later this will highlight fresh scholarships and trust schemes added
            by Gyandarshak.
          </p>
        </div>
      </div>

      <AskGyandarshak />
    </div>
  );
}

function SessionBooking({ token }) {
  const [preferred_date, setPreferredDate] = useState(null); // Date or null
  const [preferred_time, setPreferredTime] = useState("Morning");
  const [mode, setMode] = useState("online");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadMine = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(`${API_BASE}/sessions/mine`, authHeader);
      setMine(res.data);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to load your requests";
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!preferred_date) {
      setMessage("Please choose a preferred date.");
      return;
    }
    try {
      const payload = {
        preferred_date: preferred_date
          ? preferred_date.toISOString().slice(0, 10)
          : null,
        preferred_time,
        mode,
        note,
      };
      await axios.post(`${API_BASE}/sessions`, payload, authHeader);
      setMessage("Your request has been sent. You will be contacted soon.");
      setPreferredDate(null);
      setNote("");
      loadMine();
    } catch (err) {
      const detail = err.response?.data?.detail || "Could not send request";
      setMessage(detail);
    }
  };

  return (
    <div className="card">
      <h3>Counselling session request</h3>
      <form onSubmit={handleSubmit} className="form-vertical">
        <div>
          <label>Preferred date</label>
          <DatePicker
            selected={preferred_date}
            onChange={(date) => setPreferredDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
            className="react-datepicker-input"
            minDate={new Date()}
          />
        </div>

        <div>
          <label>Preferred time of day</label>
          <select
            value={preferred_time}
            onChange={(e) => setPreferredTime(e.target.value)}
          >
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
        <div>
          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div>
          <label>Note (optional)</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Briefly describe your questions or stream/class."
          />
        </div>
        <button type="submit" style={{ marginTop: 8 }}>
          Request session
        </button>
      </form>
      {message && <p>{message}</p>}

      <h4 style={{ marginTop: 12 }}>My recent requests</h4>
      {loading && <p>Loading...</p>}
      {mine.length === 0 && !loading && <p>No requests yet.</p>}
      {mine.length > 0 && (
        <ul>
          {mine.map((r) => (
            <li key={r.id}>
              {r.preferred_date} – {r.preferred_time || ""} ({r.mode || ""}) –{" "}
              <strong>{r.status}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
