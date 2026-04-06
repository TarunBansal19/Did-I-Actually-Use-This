import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboard as dashboardApi } from '../api';
import Layout from '../components/Layout';
import SubscriptionCalendar from '../components/SubscriptionCalendar';
import { getSubscriptionLogoUrl, getSubscriptionInitial } from '../utils/subscriptionLogos';
import './Dashboard.css';

const CATEGORY_LABELS = {
  entertainment: 'Entertainment',
  music: 'Music',
  tools: 'Tools',
  games: 'Games',
  education: 'Education',
  other: 'Other',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.summary()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="dashboard">
          <header className="dashboard-header">
            <h1>Dashboard</h1>
          </header>
          <div className="dashboard-content">
            <div className="dashboard-main">
              <div className="stats-row">
                <div className="stat-card skeleton-stat" />
                <div className="stat-card skeleton-stat" />
                <div className="stat-card skeleton-stat" />
              </div>
              <div className="section">
                <div className="skeleton skeleton-bar" style={{ width: '60%' }} />
                <div className="skeleton skeleton-bar" style={{ width: '40%' }} />
                <div className="skeleton skeleton-bar" style={{ width: '80%' }} />
              </div>
              <div className="subscription-grid">
                <div className="sub-card skeleton-card" />
                <div className="sub-card skeleton-card" />
                <div className="sub-card skeleton-card" />
              </div>
            </div>
            <aside className="subscription-calendar">
              <div className="calendar-card skeleton-calendar" />
            </aside>
          </div>
        </div>
      </Layout>
    );
  }
  if (error) return <Layout><div className="error">{error}</div></Layout>;
  if (!data) return null;

  const wastedCount = data.subscriptions.filter((s) => s.is_wasted).length;

  const totalSpend = data.total_monthly_spend ?? 0;
  const maxCategoryCost = Math.max(
    ...(data.categories?.map((c) => c.monthly_cost) ?? [0]),
    1
  );

  return (
    <Layout>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <Link to="/subscriptions" className="btn-primary">Manage subscriptions</Link>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-main">
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-label">Monthly spend</span>
                <span className="stat-value">₹{totalSpend.toLocaleString()}</span>
              </div>
              <div className="stat-card warning">
                <span className="stat-label">Unused this month</span>
                <span className="stat-value">{wastedCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active subscriptions</span>
                <span className="stat-value">{data.subscriptions?.length ?? 0}</span>
              </div>
            </div>

            {data.categories?.length > 0 && (
              <section className="section">
                <h2>Spend by category</h2>
                <div className="category-chart">
                  {data.categories.map((c) => (
                    <div key={c.category} className="category-chart-row">
                      <span className="category-chart-label">{CATEGORY_LABELS[c.category] || c.category}</span>
                      <div className="category-chart-bar-wrap">
                        <div
                          className="category-chart-bar"
                          style={{ width: `${(c.monthly_cost / maxCategoryCost) * 100}%` }}
                        />
                        <span className="category-chart-value">₹{c.monthly_cost?.toLocaleString()} ({c.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="section">
              <h2>Subscriptions</h2>
              {data.subscriptions?.length === 0 ? (
                <p className="empty">No subscriptions yet. <Link to="/subscriptions">Add one</Link></p>
              ) : (
                <div className="subscription-grid">
                  {data.subscriptions.map((s) => (
                    <div key={s.id} className={`sub-card ${s.is_wasted ? 'wasted' : ''}`}>
                      <div className="sub-card-header">
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
                        <div className="sub-header">
                          <h3>{s.name}</h3>
                          <span className="category-badge">{CATEGORY_LABELS[s.category] || s.category}</span>
                        </div>
                      </div>
                      <div className="sub-metrics">
                        <span>₹{s.monthly_cost?.toLocaleString()}/mo</span>
                        <span>{s.uses_this_month} uses</span>
                        {s.cost_per_use != null && (
                          <span>₹{s.cost_per_use}/use</span>
                        )}
                        {s.is_wasted && <span className="wasted-badge">Unused</span>}
                      </div>
                      <Link to={`/subscriptions`} className="sub-link">View →</Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <SubscriptionCalendar
            subscriptions={data.subscriptions ?? []}
            totalMonthlySpend={totalSpend}
          />
        </div>
      </div>
    </Layout>
  );
}
