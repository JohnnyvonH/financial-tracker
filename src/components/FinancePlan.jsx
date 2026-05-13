import React, { useMemo, useState } from 'react';
import { Calendar, Car, Home, Pencil, PiggyBank, Plus, Save, Trash2, WalletCards, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const defaultPlanningItem = {
  title: '',
  type: 'expense',
  value: '',
  targetAmount: '',
  savedAmount: '',
  expectedValue: '',
  dueDate: '',
  priority: 'medium',
  status: 'planned',
  notes: '',
};

const numberValue = (value) => Number(value || 0);

const getPlanningValue = (item) => (
  item.type === 'asset-sale'
    ? numberValue(item.expectedValue || item.targetAmount)
    : numberValue(item.targetAmount)
);

const getFormValue = (item) => (
  item.type === 'asset-sale'
    ? item.expectedValue || item.targetAmount || ''
    : item.targetAmount || ''
);

function PlanningItemCard({ item, currency, onDelete, onEdit }) {
  const value = getPlanningValue(item);
  const saved = numberValue(item.savedAmount);
  const remaining = Math.max(value - saved, 0);
  const progress = value > 0 ? Math.min((saved / value) * 100, 100) : 0;
  const icon = item.type === 'asset-sale' ? Car : item.type === 'saving' ? Home : Calendar;
  const Icon = icon;

  return (
    <article className={`planning-card planning-card-${item.priority}`}>
      <div className="planning-card-header">
        <div className="planning-title-group">
          <span className="planning-icon"><Icon size={18} /></span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.type === 'asset-sale' ? 'Asset sale' : item.type === 'saving' ? 'Savings target' : 'Upcoming cost'}</p>
          </div>
        </div>
        <div className="planning-card-actions">
          <button className="btn-icon" onClick={() => onEdit(item)} aria-label={`Edit ${item.title}`}>
            <Pencil size={16} />
          </button>
          <button className="btn-icon" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="planning-metrics">
        <div>
          <span>Value</span>
          <strong>{formatCurrency(value, currency)}</strong>
        </div>
        {item.type !== 'asset-sale' && (
          <div>
            <span>Saved</span>
            <strong>{formatCurrency(saved, currency)}</strong>
          </div>
        )}
        <div>
          <span>{item.type === 'asset-sale' ? 'Net help' : 'Remaining'}</span>
          <strong>{formatCurrency(item.type === 'asset-sale' ? value : remaining, currency)}</strong>
        </div>
      </div>

      {item.type !== 'asset-sale' && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="planning-meta">
        <span>{item.dueDate || 'No date set'}</span>
        <span>{item.status}</span>
      </div>
      {item.notes && <p className="planning-notes">{item.notes}</p>}
    </article>
  );
}

export default function FinancePlan({
  planningItems,
  onAddPlanningItem,
  onUpdatePlanningItem,
  onDeletePlanningItem,
  currency,
}) {
  const [planningForm, setPlanningForm] = useState(defaultPlanningItem);
  const [editingItemId, setEditingItemId] = useState(null);

  const planSummary = useMemo(() => {
    return planningItems.reduce((summary, item) => {
      if (item.status === 'complete') return summary;
      if (item.type === 'asset-sale') {
        summary.expectedIncome += getPlanningValue(item);
      } else {
        summary.upcomingCosts += getPlanningValue(item);
        summary.alreadySaved += numberValue(item.savedAmount);
      }
      return summary;
    }, { upcomingCosts: 0, alreadySaved: 0, expectedIncome: 0 });
  }, [planningItems]);

  const fundingGap = Math.max(planSummary.upcomingCosts - planSummary.alreadySaved - planSummary.expectedIncome, 0);

  const handlePlanningSubmit = (event) => {
    event.preventDefault();
    if (!planningForm.title.trim()) return;
    const value = numberValue(planningForm.value);
    const item = {
      ...planningForm,
      title: planningForm.title.trim(),
      targetAmount: planningForm.type === 'asset-sale' ? 0 : value,
      savedAmount: planningForm.type === 'asset-sale' ? 0 : numberValue(planningForm.savedAmount),
      expectedValue: planningForm.type === 'asset-sale' ? value : 0,
    };
    delete item.value;

    if (editingItemId) {
      onUpdatePlanningItem(editingItemId, item);
    } else {
      onAddPlanningItem(item);
    }
    setPlanningForm(defaultPlanningItem);
    setEditingItemId(null);
  };

  const updatePlanningForm = (key, value) => {
    setPlanningForm((current) => ({ ...current, [key]: value }));
  };

  const editPlanningItem = (item) => {
    setEditingItemId(item.id);
    setPlanningForm({
      ...defaultPlanningItem,
      ...item,
      value: getFormValue(item),
      savedAmount: item.type === 'asset-sale' ? '' : item.savedAmount || '',
    });
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setPlanningForm(defaultPlanningItem);
  };

  return (
    <div className="finance-plan">
      <section className="finance-hero">
        <div>
          <p className="eyebrow">Personal runway</p>
          <h1>Plan upcoming costs, asset sales, and house deposit progress</h1>
        </div>
        <div className="finance-hero-grid">
          <div>
            <span>Funding gap</span>
            <strong>{formatCurrency(fundingGap, currency)}</strong>
          </div>
          <div>
            <span>Saved toward plan</span>
            <strong>{formatCurrency(planSummary.alreadySaved, currency)}</strong>
          </div>
          <div>
            <span>Expected sale income</span>
            <strong>{formatCurrency(planSummary.expectedIncome, currency)}</strong>
          </div>
        </div>
      </section>

      <div className="plan-workspace">
        <section className="card plan-entry-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">{editingItemId ? 'Edit Plan Item' : 'Upcoming Plan'}</h2>
              <p className="section-subtitle">Track things like F-Type wheel refurb, selling the XK8, and house deposit saving.</p>
            </div>
          </div>

          <form onSubmit={handlePlanningSubmit} className="planning-form">
            <div className="form-group">
              <label htmlFor="plan-title">Item or service</label>
              <input id="plan-title" value={planningForm.title} onChange={(event) => updatePlanningForm('title', event.target.value)} placeholder="F-Type wheels refurbished" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="plan-type">Type</label>
                <select id="plan-type" value={planningForm.type} onChange={(event) => updatePlanningForm('type', event.target.value)}>
                  <option value="expense">Upcoming cost</option>
                  <option value="saving">Savings target</option>
                  <option value="asset-sale">Asset sale</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="plan-date">Target date</label>
                <input id="plan-date" type="date" value={planningForm.dueDate} onChange={(event) => updatePlanningForm('dueDate', event.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="plan-value">Value</label>
                <input id="plan-value" type="number" min="0" step="0.01" value={planningForm.value || ''} onChange={(event) => updatePlanningForm('value', event.target.value)} />
              </div>
              {planningForm.type !== 'asset-sale' && (
                <div className="form-group">
                  <label htmlFor="plan-saved">Saved so far</label>
                  <input id="plan-saved" type="number" min="0" step="0.01" value={planningForm.savedAmount} onChange={(event) => updatePlanningForm('savedAmount', event.target.value)} />
                </div>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="plan-priority">Priority</label>
                <select id="plan-priority" value={planningForm.priority} onChange={(event) => updatePlanningForm('priority', event.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="plan-status">Status</label>
                <select id="plan-status" value={planningForm.status} onChange={(event) => updatePlanningForm('status', event.target.value)}>
                  <option value="planned">Planned</option>
                  <option value="saving">Saving</option>
                  <option value="ready">Ready</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="plan-notes">Notes</label>
              <textarea id="plan-notes" value={planningForm.notes} onChange={(event) => updatePlanningForm('notes', event.target.value)} rows="3" />
            </div>
            <div className="planning-form-actions">
              <button className="btn btn-primary" type="submit">
                {editingItemId ? <Save size={16} /> : <Plus size={16} />}
                {editingItemId ? 'Save changes' : 'Add plan item'}
              </button>
              {editingItemId && (
                <button className="btn btn-secondary" type="button" onClick={cancelEditing}>
                  <X size={16} />Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel plan-guidance">
          <h2>Plan sections</h2>
          <p>Keep this page focused on dated commitments: costs to cover and asset sales that change your cash plan. Savings targets now live in Goals.</p>
          <ul className="rule-list">
            <li><strong>Upcoming costs</strong><span>Anything you need cash for, such as wheel refurbishment or insurance.</span></li>
            <li><strong>Goals</strong><span>House deposits and ring-fenced savings targets are managed on the Goals page.</span></li>
            <li><strong>Asset sales</strong><span>Use Value for what the item is worth once sold, such as the XK8.</span></li>
          </ul>
        </section>
      </div>

      <section className="finance-summary-grid">
        <div className="summary-tile">
          <PiggyBank size={20} />
          <span>Upcoming costs</span>
          <strong>{formatCurrency(planSummary.upcomingCosts, currency)}</strong>
        </div>
        <div className="summary-tile">
          <WalletCards size={20} />
          <span>Saved toward plan</span>
          <strong>{formatCurrency(planSummary.alreadySaved, currency)}</strong>
        </div>
        <div className="summary-tile">
          <Car size={20} />
          <span>Expected asset sale income</span>
          <strong>{formatCurrency(planSummary.expectedIncome, currency)}</strong>
        </div>
      </section>

      <section className="planning-list">
        {planningItems.length === 0 ? (
          <div className="empty-state card">
            <Calendar size={40} />
            <p>Add your first upcoming cost, asset sale, or savings target.</p>
          </div>
        ) : (
          planningItems.map((item) => (
            <PlanningItemCard key={item.id} item={item} currency={currency} onDelete={onDeletePlanningItem} onEdit={editPlanningItem} />
          ))
        )}
      </section>
    </div>
  );
}
