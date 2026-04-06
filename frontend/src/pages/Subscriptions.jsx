import { useState, useEffect, useCallback } from 'react';
import { subscriptions as subsApi } from '../api';
import Layout from '../components/Layout';
import SubscriptionForm from '../components/SubscriptionForm';
import { getSubscriptionLogoUrl, getSubscriptionInitial } from '../utils/subscriptionLogos';
import './Subscriptions.css';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'music', label: 'Music' },
  { value: 'tools', label: 'Tools' },
  { value: 'games', label: 'Games' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const BILLING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
  { value: 'custom', label: 'Custom' },
  { value: 'trial', label: 'Trial' },
];

export default function Subscriptions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [useTodayLoading, setUseTodayLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [unusedOnly, setUnusedOnly] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (categoryFilter) params.category = categoryFilter;
    if (unusedOnly) params.unused = 'true';
    subsApi.list(params).then(setList).finally(() => setLoading(false));
  }, [search, categoryFilter, unusedOnly]);

  useEffect(load, [load]);

  async function handleUseToday(id) {
    setUseTodayLoading(id);
    try {
      await subsApi.useToday(id);
      load();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not log usage';
      alert(msg);
    } finally {
      setUseTodayLoading(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Cancel this subscription? (You can add it again later.)')) return;
    try {
      await subsApi.remove(id);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove');
    }
  }

  function handleCreated() {
    setShowForm(false);
    setEditing(null);
    load();
  }

  function openEdit(sub) {
    setEditing(sub);
    setShowForm(false);
  }

  const activeList = list.filter((s) => s.is_active);

  return (
    <Layout>
      <div className="subscriptions-page">
        <header className="page-header">
          <h1>Subscriptions</h1>
          <button onClick={() => { setShowForm(true); setEditing(null); }} className="btn-primary">
            + Add subscription
          </button>
        </header>

        {!loading && (activeList.length > 0 || search || categoryFilter || unusedOnly) && (
          <div className="sub-filters">
            <input
              type="search"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sub-search"
              aria-label="Search subscriptions"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="sub-filter-select"
              aria-label="Filter by category"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value || '_all'} value={c.value}>{c.label}</option>
              ))}
            </select>
            <label className="sub-filter-checkbox">
              <input
                type="checkbox"
                checked={unusedOnly}
                onChange={(e) => setUnusedOnly(e.target.checked)}
              />
              <span>Unused this month</span>
            </label>
          </div>
        )}

        {(showForm || editing) && (
          <SubscriptionForm
            categories={CATEGORY_OPTIONS.filter((c) => c.value)}
            billingOptions={BILLING_OPTIONS}
            onCreated={handleCreated}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            initialData={editing}
          />
        )}

        {loading ? (
          <div className="sub-loading">
            <div className="skeleton skeleton-row" />
            <div className="skeleton skeleton-row" />
            <div className="skeleton skeleton-row" />
          </div>
        ) : activeList.length === 0 && !showForm && !editing ? (
          <div className="empty-state">
            <p>No subscriptions yet.</p>
            <p>Add one to start tracking usage and cost-per-use.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">Add your first subscription</button>
          </div>
        ) : (
          <div className="sub-list">
            {activeList.map((s) => (
              <div key={s.id} className="sub-row">
                <div className="sub-logo-wrap">
                  {getSubscriptionLogoUrl(s.name) ? (
                    <>
                      <img
                        src={getSubscriptionLogoUrl(s.name)}
                        alt=""
                        className="sub-logo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling?.classList.add('show');
                        }}
                      />
                      <span className="sub-logo-initial">{getSubscriptionInitial(s.name)}</span>
                    </>
                  ) : (
                    <span className="sub-logo-initial show">{getSubscriptionInitial(s.name)}</span>
                  )}
                </div>
                <div className="sub-info">
                  <h3>{s.name}</h3>
                  <div className="sub-meta">
                    <span>{s.category}</span>
                    <span>₹{Number(s.cost).toLocaleString()} / {s.billing_frequency}</span>
                    <span>Renews: {s.renewal_date}</span>
                  </div>
                  {s.cancel_url && (
                    <a href={s.cancel_url} target="_blank" rel="noreferrer" className="cancel-link">Cancel link</a>
                  )}
                </div>
                <div className="sub-actions">
                  <button onClick={() => openEdit(s)} className="btn-edit" title="Edit subscription">Edit</button>
                  <button
                    onClick={() => handleUseToday(s.id)}
                    disabled={useTodayLoading === s.id || s.used_today}
                    className={`btn-use ${s.used_today ? 'used' : ''}`}
                    title={s.used_today ? 'Already logged for today' : 'Log that you used this today'}
                  >
                    {useTodayLoading === s.id ? '…' : s.used_today ? 'Used today' : 'Use today'}
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="btn-remove" title="Cancel subscription">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
