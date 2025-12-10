import React from "react";
import { useTranslation } from "react-i18next";
import logo from "./gd_logo+tag.png";

function HomePage({ onLogin, onRegister }) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero section */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            One platform for exams, colleges, and scholarships.
          </h1>
          <p className="hero-subtitle">
            Gyandarshak connects students and parents with trusted career
            counselling, college admissions guidance, and real scholarship
            opportunities – starting from Jharkhand, built for all of India.
          </p>
          <div className="hero-cta-row">
            <button onClick={onLogin}>{t("auth.login")}</button>
            <button onClick={onRegister} className="btn-secondary">
              Create free account
            </button>
          </div>
          <p className="hero-note">
            For students of classes 9–12, droppers, graduates, and parents who
            want clear guidance – in English and Hindi.
          </p>
        </div>

        <div className="hero-right">
          <img src={logo} alt="Gyandarshak logo" className="hero-logo" />
          <p className="hero-tagline">Guiding Knowledge. Shaping Futures.</p>
        </div>
      </section>

      {/* Why Gyandarshak */}
      <section className="section">
        <h2>Why Gyandarshak?</h2>
        <div className="grid-3">
          <div className="card">
            <h3>Personal counselling</h3>
            <p>
              Talk to an experienced counsellor who understands Jharkhand
              students, parents, and colleges.
            </p>
          </div>
          <div className="card">
            <h3>College &amp; exam clarity</h3>
            <p>
              Explore colleges, entrance exams, and last dates in one place
              instead of jumping between many sites.
            </p>
          </div>
          <div className="card">
            <h3>Scholarships &amp; support</h3>
            <p>
              Discover government schemes, trust-based scholarships, and special
              discounts via tie-ups.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2>How it works</h2>
        <ol className="how-list">
          <li>
            Create your account and fill basic details (class, stream,
            district).
          </li>
          <li>
            Browse exams, colleges, and scholarships matched to your profile.
          </li>
          <li>
            Book a counselling session and plan the best path for your future.
          </li>
        </ol>
      </section>

      {/* Call-to-action footer */}
      <section className="section section-cta">
        <h2>Ready to start your journey?</h2>
        <p>
          Join Gyandarshak today and keep all your exam, college, and
          scholarship planning in one trusted place.
        </p>
        <div className="hero-cta-row">
          <button onClick={onRegister}>Get started – it’s free</button>
          <button onClick={onLogin} className="btn-secondary">
            I already have an account
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
