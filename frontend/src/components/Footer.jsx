import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <span className="app-footer-title">Did I Actually Use This?</span>
          <span className="app-footer-tagline">Track subscriptions. Log usage. Stop wasting money.</span>
        </div>
        <div className="app-footer-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/subscriptions">Subscriptions</Link>
          <Link to="/settings">Settings</Link>
        </div>
      </div>
      <div className="app-footer-bottom">
        <p>Helping you avoid paying for things you don’t use.</p>
      </div>
    </footer>
  );
}
