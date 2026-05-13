import React, { useMemo, useState } from 'react';
import { CalendarClock, Plus, RefreshCw, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getMonthlyEquivalent } from '../utils/financeSummary';
import RecurringTransactionForm from './RecurringTransactionForm';
import RecurringTransactionList from './RecurringTransactionList';

function SummaryTile({ label, value, detail, icon: Icon, tone = 'info' }) {
  return (
    <article className={`metric-tile metric-tile-${tone}`}>
      <div className="metric-tile-icon">
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <p>{detail}</p>}
      </div>
    </article>
  );
}

export default function RecurringPaymentsPage({
  recurringTransactions,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onToggleRecurring,
  currency,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const summary = useMemo(() => recurringTransactions.reduce((result, item) => {
    if (item.active === false) {
      result.paused += 1;
      return result;
    }

    const monthlyAmount = getMonthlyEquivalent(item.amount, item.frequency);
    if (item.type === 'income') {
      result.income += monthlyAmount;
    } else {
      result.outgoings += monthlyAmount;
    }

    result.active += 1;
    return result;
  }, {
    active: 0,
    paused: 0,
    income: 0,
    outgoings: 0,
  }), [recurringTransactions]);

  const monthlyNet = summary.income - summary.outgoings;

  const handleSubmit = async (values) => {
    const saved = editingRecurring
      ? await onUpdateRecurring(editingRecurring.id, values)
      : await onAddRecurring(values);

    if (!saved) {
      return;
    }

    setShowForm(false);
    setEditingRecurring(null);
  };

  const handleEdit = (recurring) => {
    setEditingRecurring(recurring);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecurring(null);
  };

  return (
    <div className="recurring-workspace">
      <section className="dashboard-hero recurring-hero">
        <div>
          <h1>Recurring payments</h1>
          <p>
            Manage salary, subscriptions, bills, transfers, and predictable spending in one place. These entries drive the dashboard's monthly savings capacity.
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingRecurring(null);
              setShowForm(true);
            }}
          >
            <Plus size={17} />
            Add recurring item
          </button>
        </div>
      </section>

      <section className="metric-grid recurring-summary-grid">
        <SummaryTile
          label="Monthly income"
          value={formatCurrency(summary.income, currency)}
          detail="Active recurring income"
          icon={TrendingUp}
          tone="positive"
        />
        <SummaryTile
          label="Monthly outgoings"
          value={formatCurrency(summary.outgoings, currency)}
          detail="Active recurring payments"
          icon={TrendingDown}
          tone={summary.outgoings > summary.income ? 'warning' : 'info'}
        />
        <SummaryTile
          label="Net monthly rhythm"
          value={`${monthlyNet >= 0 ? '+' : '-'}${formatCurrency(Math.abs(monthlyNet), currency)}`}
          detail="Income minus recurring outgoings"
          icon={WalletCards}
          tone={monthlyNet >= 0 ? 'positive' : 'danger'}
        />
        <SummaryTile
          label="Tracked items"
          value={`${summary.active} active`}
          detail={summary.paused > 0 ? `${summary.paused} paused` : 'No paused items'}
          icon={CalendarClock}
          tone="info"
        />
      </section>

      {showForm && (
        <RecurringTransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialType={editingRecurring?.type || 'expense'}
          initialValues={editingRecurring}
          submitLabel={editingRecurring ? 'Save changes' : 'Create recurring item'}
        />
      )}

      <RecurringTransactionList
        recurringTransactions={recurringTransactions}
        onDelete={onDeleteRecurring}
        onToggleActive={onToggleRecurring}
        onEdit={handleEdit}
        currency={currency}
      />
    </div>
  );
}
