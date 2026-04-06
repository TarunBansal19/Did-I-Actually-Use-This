import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import ThemeToggle, { getStoredTheme } from './ThemeToggle';
import Footer from './Footer';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const loc = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', getStoredTheme());
  }, []);

  return (
    <div className="layout">
      <header className="nav">
        <Link to="/dashboard" className="nav-brand">Did I Actually Use This?</Link>
        <div className="nav-links">
          <Link to="/dashboard" className={loc.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
          <Link to="/subscriptions" className={loc.pathname === '/subscriptions' ? 'active' : ''}>Subscriptions</Link>
          <Link to="/settings" className={loc.pathname === '/settings' ? 'active' : ''}>Settings</Link>
          <ThemeToggle />
          <span className="nav-user">{user?.username}</span>
          <button onClick={logout} className="nav-logout">Log out</button>
        </div>
      </header>
      <main className="main">{children}</main>
      <Footer />
    </div>
  );
}
