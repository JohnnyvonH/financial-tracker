import React, { useMemo, useState } from 'react';
import { Calendar, Car, Home, PiggyBank, Plus, Trash2, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const defaultPlanningItem = {
  title: '',
  type: 'expense',
  targetAmount: '',
  savedAmount: '',
  expectedValue: '',
  dueDate: '',
  priority: 'medium',
  status: 'planned',
  notes: '',
};

const numberValue = (value) => Number(value || 0);

function PlanningItemCard({ item, currency, onDelete }) {
  const target = numberValue(item.targetAmount);
  const saved = numberValue(item.savedAmount);
  const expectedValue = numberValue(item.expectedValue);
  const remaining = Math.max(target - saved, 0);
  const progress = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
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
        <button className="btn-icon" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="planning-metrics">
        <div>
          <span>Target</span>
          <strong>{formatCurrency(target, currency)}</strong>
        </div>
        <div>
          <span>{item.type === 'asset-sale' ? 'Expected' : 'Saved'}</span>
          <strong>{formatCurrency(item.type === 'asset-sale' ? expectedValue : saved, currency)}</strong>
        </div>
        <div>
          <span>{item.type === 'asset-sale' ? 'Net help' : 'Remaining'}</span>
          <strong>{formatCurrency(item.type === 'asset-sale' ? expectedValue - target : remaining, currency)}</strong>
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
  onDeletePlanningItem,
  currency,
}) {
  const [planningForm, setPlanningForm] = useState(defaultPlanningItem);

  const planSummary = useMemo(() => {
    return planningItems.reduce((summary, item) => {
      if (item.status === 'complete') return summary;
      if (item.type === 'asset-sale') {
        summary.expectedIncome += numberValue(item.expectedValue);
      } else {
        summary.upcomingCosts += numberValue(item.targetAmount);
        summary.alreadySaved += numberValue(item.savedAmount);
      }
      return summary;
    }, { upcomingCosts: 0, alreadySaved: 0, expectedIncome: 0 });
  }, [planningItems]);

  const fundingGap = Math.max(planSummary.upcomingCosts - planSummary.alreadySaved - planSummary.expectedIncome, 0);

  const handlePlanningSubmit = (event) => {
    event.preventDefault();
    if (!planningForm.title.trim()) return;
    onAddPlanningItem({
      ...planningForm,
      title: planningForm.title.trim(),
      targetAmount: numberValue(planningForm.targetAmount),
      savedAmount: numberValue(planningForm.savedAmount),
      expectedValue: numberValue(planningForm.expectedValue),
    });
    setPlanningForm(defaultPlanningItem);
  };

  const updatePlanningForm = (key, value) => {
    setPlanningForm((current) => ({ ...current, [key]: value }));
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
              <h2 className="section-title">Upcoming Plan</h2>
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
                <label htmlFor="plan-target">Cost or target</label>
                <input id="plan-target" type="number" min="0" step="0.01" value={planningForm.targetAmount} onChange={(event) => updatePlanningForm('targetAmount', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="plan-saved">Saved so far</label>
                <input id="plan-saved" type="number" min="0" step="0.01" value={planningForm.savedAmount} onChange={(event) => updatePlanningForm('savedAmount', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="plan-value">Expected sale value</label>
                <input id="plan-value" type="number" min="0" step="0.01" value={planningForm.expectedValue} onChange={(event) => updatePlanningForm('expectedValue', event.target.value)} />
              </div>
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
            <button className="btn btn-primary" type="submit"><Plus size={16} />Add plan item</button>
          </form>
        </section>

        <section className="panel plan-guidance">
          <h2>Plan sections</h2>
          <p>Keep this page focused on future commitments: costs to cover, savings targets, and asset sales that change the plan.</p>
          <ul className="rule-list">
            <li><strong>Upcoming costs</strong><span>Anything you need cash for, such as wheel refurbishment or insurance.</span></li>
            <li><strong>Savings targets</strong><span>House deposit milestones and other ring-fenced goals.</span></li>
            <li><strong>Asset sales</strong><span>Expected proceeds from selling an item, such as the XK8.</span></li>
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
            <PlanningItemCard key={item.id} item={item} currency={currency} onDelete={onDeletePlanningItem} />
          ))
        )}
      </section>
    </div>
  );
}
