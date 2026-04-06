import { useState, useEffect } from 'react';
import { reminders as remindersApi } from '../api';
import Layout from '../components/Layout';
import './Settings.css';

const REMINDER_DAY_OPTIONS = [
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '7 days before' },
  { value: 14, label: '14 days before' },
];

export default function Settings() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    remindersApi.getPreferences()
      .then((data) => {
        setPrefs({
          reminders_enabled: data.reminders_enabled !== false,
          reminder_days_list: data.reminder_days_list || [7, 3, 1],
        });
      })
      .catch(() => setError('Failed to load preferences'))
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(day) {
    if (!prefs) return;
    const list = prefs.reminder_days_list || [];
    const next = list.includes(day) ? list.filter((d) => d !== day) : [...list, day].sort((a, b) => a - b);
    setPrefs({ ...prefs, reminder_days_list: next });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!prefs) return;
    setSaving(true);
    setError('');
    try {
      await remindersApi.updatePreferences({
        reminders_enabled: prefs.reminders_enabled,
        reminder_days_list: prefs.reminder_days_list,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="settings-page">
          <h1>Settings</h1>
          <div className="settings-loading">Loading…</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-page">
        <h1>Settings</h1>
        <form onSubmit={handleSave} className="settings-form">
          {error && <div className="settings-error">{error}</div>}
          <section className="settings-section">
            <h2>Email reminders</h2>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={prefs?.reminders_enabled ?? true}
                onChange={(e) => setPrefs({ ...prefs, reminders_enabled: e.target.checked })}
              />
              <span>Send renewal reminder emails</span>
            </label>
            <p className="settings-hint">When to send reminders (you can pick more than one):</p>
            <div className="settings-days">
              {REMINDER_DAY_OPTIONS.map((opt) => (
                <label key={opt.value} className="settings-day">
                  <input
                    type="checkbox"
                    checked={(prefs?.reminder_days_list || []).includes(opt.value)}
                    onChange={() => toggleDay(opt.value)}
                    disabled={!prefs?.reminders_enabled}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </section>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
