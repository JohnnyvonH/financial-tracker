import React, { useMemo, useState } from 'react';
import { Calendar, Car, Home, PiggyBank, Plus, Trash2, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const today = new Date().toISOString().split('T')[0];

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

const defaultSnapshot = {
  date: today,
  santander: '',
  tesco: '',
  amexCashback: '',
  moneybox: '',
  moneyboxStocksSharesIsa: '',
  moneyboxLifetimeIsa: '',
  moneyboxSimpleSaver: '',
  moneyboxCashIsa: '',
  moneyboxMonthly: '',
  notes: '',
  paycheck: '',
  estimatedBankNextPaycheck: '',
  pension: '',
};

const numberValue = (value) => Number(value || 0);

function getSnapshotTotals(snapshot = {}) {
  const availableAssets = [
    snapshot.santander,
    snapshot.tesco,
    snapshot.amexCashback,
    snapshot.moneybox,
    snapshot.moneyboxStocksSharesIsa,
    snapshot.moneyboxLifetimeIsa,
    snapshot.moneyboxSimpleSaver,
    snapshot.moneyboxCashIsa,
  ].reduce((sum, value) => sum + numberValue(value), 0);

  const bankNextPaycheck = numberValue(snapshot.estimatedBankNextPaycheck);
  const total = availableAssets + numberValue(snapshot.paycheck);
  const allAssets = availableAssets + numberValue(snapshot.pension);

  return {
    total,
    availableAssets,
    bankNextPaycheck,
    allAssets,
  };
}

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
  netWorthSnapshots,
  onAddPlanningItem,
  onDeletePlanningItem,
  onAddNetWorthSnapshot,
  onDeleteNetWorthSnapshot,
  currency,
}) {
  const [planningForm, setPlanningForm] = useState(defaultPlanningItem);
  const [snapshotForm, setSnapshotForm] = useState(defaultSnapshot);

  const latestSnapshot = netWorthSnapshots[0];
  const latestTotals = getSnapshotTotals(latestSnapshot);

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

  const handleSnapshotSubmit = (event) => {
    event.preventDefault();
    onAddNetWorthSnapshot({
      ...snapshotForm,
      date: snapshotForm.date || today,
    });
    setSnapshotForm(defaultSnapshot);
  };

  const updatePlanningForm = (key, value) => {
    setPlanningForm((current) => ({ ...current, [key]: value }));
  };

  const updateSnapshotForm = (key, value) => {
    setSnapshotForm((current) => ({ ...current, [key]: value }));
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
            <span>Available assets</span>
            <strong>{formatCurrency(latestTotals.availableAssets, currency)}</strong>
          </div>
          <div>
            <span>All assets</span>
            <strong>{formatCurrency(latestTotals.allAssets, currency)}</strong>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
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

        <section className="card">
          <h2 className="section-title">Spreadsheet Snapshot</h2>
          <p className="section-subtitle">A structured version of the workbook columns for account balances, MoneyBox, paycheck, and pension tracking.</p>
          <form onSubmit={handleSnapshotSubmit} className="snapshot-form">
            <div className="form-group">
              <label htmlFor="snapshot-date">Date</label>
              <input id="snapshot-date" type="date" value={snapshotForm.date} onChange={(event) => updateSnapshotForm('date', event.target.value)} />
            </div>
            <div className="snapshot-grid">
              {[
                ['santander', 'Santander'],
                ['tesco', 'Tesco'],
                ['amexCashback', 'Amex - Cashback'],
                ['moneybox', 'MoneyBox'],
                ['moneyboxStocksSharesIsa', 'MoneyBox - S&S ISA'],
                ['moneyboxLifetimeIsa', 'MoneyBox - Lifetime ISA'],
                ['moneyboxSimpleSaver', 'MoneyBox - Simple Saver'],
                ['moneyboxCashIsa', 'MoneyBox - Cash ISA'],
                ['moneyboxMonthly', 'MoneyBox Monthly'],
                ['paycheck', 'Paycheck'],
                ['estimatedBankNextPaycheck', 'Estimated Bank Next Paycheck'],
                ['pension', 'Pension'],
              ].map(([key, label]) => (
                <div className="form-group" key={key}>
                  <label htmlFor={`snapshot-${key}`}>{label}</label>
                  <input id={`snapshot-${key}`} type="number" step="0.01" value={snapshotForm[key]} onChange={(event) => updateSnapshotForm(key, event.target.value)} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label htmlFor="snapshot-notes">Notes</label>
              <textarea id="snapshot-notes" value={snapshotForm.notes} onChange={(event) => updateSnapshotForm('notes', event.target.value)} rows="3" />
            </div>
            <button className="btn btn-primary" type="submit"><WalletCards size={16} />Save snapshot</button>
          </form>
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

      <section className="card">
        <h2 className="section-title">Net Worth History</h2>
        <div className="snapshot-table-wrap">
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total</th>
                <th>Available Assets</th>
                <th>Pension</th>
                <th>All Assets</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {netWorthSnapshots.map((snapshot) => {
                const totals = getSnapshotTotals(snapshot);
                return (
                  <tr key={snapshot.id}>
                    <td>{snapshot.date}</td>
                    <td>{formatCurrency(totals.total, currency)}</td>
                    <td>{formatCurrency(totals.availableAssets, currency)}</td>
                    <td>{formatCurrency(numberValue(snapshot.pension), currency)}</td>
                    <td>{formatCurrency(totals.allAssets, currency)}</td>
                    <td>{snapshot.notes}</td>
                    <td>
                      <button className="btn-icon" onClick={() => onDeleteNetWorthSnapshot(snapshot.id)} aria-label={`Delete snapshot ${snapshot.date}`}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {netWorthSnapshots.length === 0 && <p className="empty-table">No snapshots yet.</p>}
        </div>
      </section>
    </div>
  );
}
