import React, { useMemo, useState } from 'react';
import { CheckCircle2, Info, Plus, Trash2, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getSnapshotTotals } from '../utils/financeSummary';

const today = new Date().toISOString().split('T')[0];

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
  total: '',
  totalValueAvailableAssets: '',
  totalValueAllAssets: '',
};

const snapshotFields = [
  {
    title: 'Bank and card balances',
    help: 'Current balances at the snapshot date.',
    fields: [
      ['santander', 'Santander'],
      ['tesco', 'Tesco'],
      ['amexCashback', 'Amex - Cashback'],
    ],
  },
  {
    title: 'MoneyBox accounts',
    help: 'MoneyBox can be entered as a total, or checked against the account breakdown.',
    fields: [
      ['moneybox', 'MoneyBox total'],
      ['moneyboxStocksSharesIsa', 'MoneyBox - S&S ISA'],
      ['moneyboxLifetimeIsa', 'MoneyBox - Lifetime ISA'],
      ['moneyboxSimpleSaver', 'MoneyBox - Simple Saver'],
      ['moneyboxCashIsa', 'MoneyBox - Cash ISA'],
      ['moneyboxMonthly', 'MoneyBox Monthly'],
    ],
  },
  {
    title: 'Income and long-term value',
    help: 'Paycheck, next-paycheck estimate, and pension are kept separate so the snapshot remains auditable.',
    fields: [
      ['paycheck', 'Paycheck'],
      ['estimatedBankNextPaycheck', 'Estimated Bank Next Paycheck'],
      ['pension', 'Pension'],
    ],
  },
  {
    title: 'Spreadsheet totals',
    help: 'Leave blank to let the app calculate them, or enter your sheet values to preserve an existing row exactly.',
    fields: [
      ['total', 'Total'],
      ['totalValueAvailableAssets', 'Total Value of Available Assets'],
      ['totalValueAllAssets', 'Total Value of all Assets'],
    ],
  },
];

const numberValue = (value) => Number(value || 0);

function SnapshotMetric({ label, value, detail }) {
  return (
    <div className="snapshot-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}

function DifferenceBadge({ label, difference, currency }) {
  const absDifference = Math.abs(difference);
  const isMatched = absDifference < 0.01;

  return (
    <div className={`snapshot-difference ${isMatched ? 'snapshot-difference-ok' : 'snapshot-difference-review'}`}>
      {isMatched ? <CheckCircle2 size={16} /> : <Info size={16} />}
      <span>{label}</span>
      <strong>{isMatched ? 'Matched' : formatCurrency(difference, currency)}</strong>
    </div>
  );
}

export default function FinancialSnapshot({
  netWorthSnapshots,
  onAddNetWorthSnapshot,
  onDeleteNetWorthSnapshot,
  currency,
}) {
  const [snapshotForm, setSnapshotForm] = useState(defaultSnapshot);
  const latestSnapshot = netWorthSnapshots[0];
  const latestTotals = getSnapshotTotals(latestSnapshot);
  const draftTotals = useMemo(() => getSnapshotTotals(snapshotForm), [snapshotForm]);

  const updateSnapshotForm = (key, value) => {
    setSnapshotForm((current) => ({ ...current, [key]: value }));
  };

  const handleSnapshotSubmit = (event) => {
    event.preventDefault();
    onAddNetWorthSnapshot({
      ...snapshotForm,
      date: snapshotForm.date || today,
    });
    setSnapshotForm(defaultSnapshot);
  };

  return (
    <div className="financial-snapshot">
      <section className="finance-hero snapshot-hero">
        <div>
          <p className="eyebrow">Financial snapshot</p>
          <h1>Track your full position at a point in time</h1>
          <p>
            Port the workbook row into structured sections, keep the totals visible, and compare every snapshot against the same rules.
          </p>
        </div>
        <div className="finance-hero-grid">
          <SnapshotMetric
            label="Latest total"
            value={formatCurrency(latestTotals.total, currency)}
            detail={latestSnapshot?.date || 'No snapshot yet'}
          />
          <SnapshotMetric
            label="Available assets"
            value={formatCurrency(latestTotals.availableAssets, currency)}
          />
          <SnapshotMetric
            label="All assets"
            value={formatCurrency(latestTotals.allAssets, currency)}
          />
        </div>
      </section>

      <div className="snapshot-layout">
        <section className="card snapshot-entry-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">Add current finances</h2>
              <p className="section-subtitle">One entry equals one dated snapshot of your finances.</p>
            </div>
          </div>

          <form onSubmit={handleSnapshotSubmit} className="snapshot-form">
            <div className="form-group snapshot-date-field">
              <label htmlFor="snapshot-date">Date</label>
              <input id="snapshot-date" type="date" value={snapshotForm.date} onChange={(event) => updateSnapshotForm('date', event.target.value)} />
            </div>

            {snapshotFields.map((section) => (
              <fieldset className="snapshot-fieldset" key={section.title}>
                <legend>{section.title}</legend>
                <p>{section.help}</p>
                <div className="snapshot-grid">
                  {section.fields.map(([key, label]) => (
                    <div className="form-group" key={key}>
                      <label htmlFor={`snapshot-${key}`}>{label}</label>
                      <input id={`snapshot-${key}`} type="number" step="0.01" value={snapshotForm[key]} onChange={(event) => updateSnapshotForm(key, event.target.value)} />
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="form-group">
              <label htmlFor="snapshot-notes">Notes</label>
              <textarea id="snapshot-notes" value={snapshotForm.notes} onChange={(event) => updateSnapshotForm('notes', event.target.value)} rows="3" placeholder="New XF and Parents £3500" />
            </div>

            <button className="btn btn-primary" type="submit"><Plus size={16} />Save financial snapshot</button>
          </form>
        </section>

        <aside className="snapshot-rules">
          <section className="panel">
            <h2>Calculation rules</h2>
            <ul className="rule-list">
              <li><strong>MoneyBox total</strong><span>Entered MoneyBox total, or the sum of S&S ISA, Lifetime ISA, Simple Saver, Cash ISA, and monthly amount.</span></li>
              <li><strong>Total</strong><span>Entered sheet total, or Santander + Tesco + Amex Cashback + MoneyBox total + Paycheck.</span></li>
              <li><strong>Available assets</strong><span>Entered sheet value, or Total minus Lifetime ISA.</span></li>
              <li><strong>All assets</strong><span>Entered sheet value, or Total + Pension.</span></li>
            </ul>
          </section>

          <section className="panel">
            <h2>Draft totals</h2>
            <div className="snapshot-metric-stack">
              <SnapshotMetric label="MoneyBox total" value={formatCurrency(draftTotals.moneyboxTotal, currency)} />
              <SnapshotMetric label="Total" value={formatCurrency(draftTotals.total, currency)} />
              <SnapshotMetric label="Available assets" value={formatCurrency(draftTotals.availableAssets, currency)} />
              <SnapshotMetric label="All assets" value={formatCurrency(draftTotals.allAssets, currency)} />
            </div>
            <div className="snapshot-difference-stack">
              <DifferenceBadge label="MoneyBox check" difference={draftTotals.moneyboxVariance} currency={currency} />
              <DifferenceBadge label="Total check" difference={draftTotals.totalVariance} currency={currency} />
            </div>
          </section>
        </aside>
      </div>

      <section className="card">
        <h2 className="section-title">Financial Snapshot History</h2>
        <div className="snapshot-table-wrap">
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Santander</th>
                <th>Tesco</th>
                <th>Amex</th>
                <th>MoneyBox</th>
                <th>Paycheck</th>
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
                    <td>{formatCurrency(numberValue(snapshot.santander), currency)}</td>
                    <td>{formatCurrency(numberValue(snapshot.tesco), currency)}</td>
                    <td>{formatCurrency(numberValue(snapshot.amexCashback), currency)}</td>
                    <td>{formatCurrency(totals.moneyboxTotal, currency)}</td>
                    <td>{formatCurrency(numberValue(snapshot.paycheck), currency)}</td>
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
          {netWorthSnapshots.length === 0 && <p className="empty-table">No financial snapshots yet.</p>}
        </div>
      </section>
    </div>
  );
}
