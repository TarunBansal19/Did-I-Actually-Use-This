import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './SubscriptionCalendar.css';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const CATEGORY_COLORS = {
  entertainment: '#e63946',
  music: '#9b5de5',
  tools: '#00b4d8',
  games: '#f77f00',
  education: '#2d6a4f',
  other: '#6c757d',
};

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevLast = new Date(prevYear, prevMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) {
    cells.push({
      date: prevLast - startPad + i + 1,
      month: 'prev',
      year: prevYear,
      monthIndex: prevMonth,
      key: `prev-${i}`,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: d,
      month: 'current',
      year,
      monthIndex: month,
      key: `curr-${d}`,
    });
  }
  const remaining = 42 - cells.length;
  for (let i = 0; i < remaining; i++) {
    cells.push({
      date: i + 1,
      month: 'next',
      year: month === 11 ? year + 1 : year,
      monthIndex: month === 11 ? 0 : month + 1,
      key: `next-${i}`,
    });
  }
  return cells;
}

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function SubscriptionCalendar({ subscriptions = [], totalMonthlySpend = 0 }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [viewMode, setViewMode] = useState('monthly'); // monthly | yearly

  const renewalsByDate = useMemo(() => {
    const map = {};
    subscriptions.forEach((sub) => {
      if (!sub.renewal_date) return;
      const key = sub.renewal_date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(sub);
    });
    return map;
  }, [subscriptions]);

  const newCount = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return subscriptions.filter((s) => (s.created_at || '').slice(0, 10) >= cutoffStr).length;
  }, [subscriptions]);

  const monthLabel = useMemo(() => {
    return new Date(viewDate.year, viewDate.month).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  }, [viewDate.year, viewDate.month]);

  const cells = useMemo(
    () => getMonthDays(viewDate.year, viewDate.month),
    [viewDate.year, viewDate.month]
  );

  function goPrev() {
    setViewDate((d) => {
      if (d.month === 0) return { year: d.year - 1, month: 11 };
      return { year: d.year, month: d.month - 1 };
    });
  }

  function goNext() {
    setViewDate((d) => {
      if (d.month === 11) return { year: d.year + 1, month: 0 };
      return { year: d.year, month: d.month + 1 };
    });
  }

  function goToday() {
    setViewDate({ year: today.getFullYear(), month: today.getMonth() });
  }

  const displayTotal =
    viewMode === 'yearly'
      ? (totalMonthlySpend * 12).toFixed(2)
      : (totalMonthlySpend ?? 0).toFixed(2);
  const totalLabel = viewMode === 'yearly' ? 'YEARLY TOTAL' : 'MONTHLY TOTAL';

  return (
    <aside className="subscription-calendar">
      <div className="calendar-card">
        <div className="calendar-header">
          <h2 className="calendar-title">{monthLabel}</h2>
          <div className="calendar-nav">
            <button type="button" className="calendar-btn today" onClick={goToday}>
              Today
            </button>
            <button type="button" className="calendar-btn arrow" onClick={goPrev} aria-label="Previous month">
              ‹
            </button>
            <button type="button" className="calendar-btn arrow" onClick={goNext} aria-label="Next month">
              ›
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((d) => (
            <span key={d} className="calendar-weekday">
              {d}
            </span>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((cell) => {
            const key = dateKey(cell.year, cell.monthIndex, cell.date);
            const renewals = renewalsByDate[key] || [];
            const isToday =
              cell.month === 'current' &&
              cell.date === today.getDate() &&
              viewDate.month === today.getMonth() &&
              viewDate.year === today.getFullYear();
            const isCurrentMonth = cell.month === 'current';

            return (
              <div
                key={cell.key}
                className={`calendar-cell ${cell.month !== 'current' ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <span className="calendar-cell-date">{cell.date}</span>
                <div className="calendar-cell-dots">
                  {renewals.slice(0, 3).map((sub) => (
                    <span
                      key={sub.id}
                      className="calendar-dot"
                      style={{ backgroundColor: CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.other }}
                      title={`${sub.name} – ₹${sub.monthly_cost}/mo`}
                    >
                      {sub.name.charAt(0).toUpperCase()}
                    </span>
                  ))}
                  {renewals.length > 3 && (
                    <span className="calendar-dot more">+{renewals.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="calendar-footer">
          <div className="calendar-view-toggle">
            <button
              type="button"
              className={viewMode === 'monthly' ? 'active' : ''}
              onClick={() => setViewMode('monthly')}
            >
              MONTHLY
            </button>
            <button
              type="button"
              className={viewMode === 'yearly' ? 'active' : ''}
              onClick={() => setViewMode('yearly')}
            >
              YEARLY
            </button>
          </div>
          <div className="calendar-analytics">
            <span className="calendar-stat">
              {subscriptions.length} SUBSCRIPTIONS
              {newCount > 0 && ` / ${newCount} NEW`}
            </span>
            <span className="calendar-total">
              {totalLabel}: <strong>₹{Number(displayTotal).toLocaleString()}</strong>
            </span>
          </div>
        </div>

        <div className="calendar-actions">
          <Link to="/subscriptions" className="calendar-add-btn" title="Add subscription" aria-label="Add subscription">
            +
          </Link>
        </div>
      </div>
    </aside>
  );
}
