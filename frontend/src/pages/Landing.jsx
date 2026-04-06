import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <span className="landing-brand">Did I Actually Use This?</span>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link to="/login" className="landing-btn ghost">Log in</Link>
          <Link to="/register" className="landing-btn primary">Sign up</Link>
        </div>
      </header>

      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="landing-title">
            Track subscriptions.<br />
            Log usage.<br />
            <span className="landing-title-accent">Stop wasting money.</span>
          </h1>
          <p className="landing-tagline">
            See which subscriptions you actually use. One tap to log “used today,”
            get renewal reminders, and keep your spending honest.
          </p>
          <div className="landing-cta">
            <Link to="/register" className="landing-cta-primary">
              Get started — it’s free
            </Link>
            <Link to="/login" className="landing-cta-secondary">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="landing-features">
          <div className="landing-feature">
            <span className="landing-feature-icon">📅</span>
            <h3>Renewal calendar</h3>
            <p>See when each subscription renews and spot duplicates.</p>
          </div>
          <div className="landing-feature">
            <span className="landing-feature-icon">✓</span>
            <h3>Used today</h3>
            <p>One tap to log usage. Know what you’re really using each month.</p>
          </div>
          <div className="landing-feature">
            <span className="landing-feature-icon">📧</span>
            <h3>Email reminders</h3>
            <p>Get reminded 7, 3, and 1 day before renewal so you can cancel in time.</p>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p className="landing-footer-brand">Did I Actually Use This?</p>
        <p className="landing-footer-tagline">Helping you avoid paying for things you don’t use.</p>
        <div className="landing-footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
