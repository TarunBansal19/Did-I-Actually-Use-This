import { useState, useEffect } from 'react';
import { subscriptions as subsApi } from '../api';

export default function SubscriptionForm({ categories, billingOptions, onCreated, onCancel, initialData }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [cost, setCost] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('monthly');
  const [renewalDate, setRenewalDate] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'other');
      setCost(initialData.cost != null ? String(initialData.cost) : '');
      setBillingFrequency(initialData.billing_frequency || 'monthly');
      setRenewalDate(initialData.renewal_date || '');
      setCancelUrl(initialData.cancel_url || '');
      setRemindersEnabled(initialData.reminders_enabled !== false);
    }
  }, [initialData]);

  function formatErrors(err) {
    if (err.response?.data) {
      const d = err.response.data;
      if (typeof d === 'string') return d;
      return Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join('. ');
    }
    return 'Failed to save';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      name,
      category,
      cost: parseFloat(cost),
      billing_frequency: billingFrequency,
      renewal_date: renewalDate,
      cancel_url: cancelUrl || null,
      reminders_enabled: remindersEnabled,
    };
    try {
      if (isEdit) {
        await subsApi.update(initialData.id, payload);
        onCreated?.();
      } else {
        await subsApi.create(payload);
        onCreated?.();
      }
    } catch (err) {
      setError(formatErrors(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sub-form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Netflix"
          required
          maxLength={100}
        />
      </div>
      <div className="form-row">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="form-row two-cols">
        <div>
          <label>Cost (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label>Billing</label>
          <select value={billingFrequency} onChange={(e) => setBillingFrequency(e.target.value)}>
            {billingOptions.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <label>Renewal date</label>
        <input
          type="date"
          value={renewalDate}
          onChange={(e) => setRenewalDate(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <label>Cancel URL (optional)</label>
        <input
          type="url"
          value={cancelUrl}
          onChange={(e) => setCancelUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="form-row form-row-checkbox">
        <label>
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={(e) => setRemindersEnabled(e.target.checked)}
          />
          <span>Send renewal reminder emails for this subscription</span>
        </label>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add subscription'}
        </button>
      </div>
    </form>
  );
}
