import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ui-theme';

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (_) {}
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredTheme(theme);
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={`Current: ${theme}. Toggle theme`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
