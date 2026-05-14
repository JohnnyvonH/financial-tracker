import React, { useMemo, useState } from 'react';
import { CalendarClock, Plus, RefreshCw, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getMonthlyEquivalent } from '../utils/financeSummary';
import { getUpcomingRecurringOccurrences } from '../utils/recurring';
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

const formatForecastDate = (dateString) => {
  const [year, month, day] = String(dateString).split('-').map(Number);
  if (!year || !month || !day) return 'No date';

  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
};

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
  const upcomingOccurrences = useMemo(
    () => getUpcomingRecurringOccurrences(recurringTransactions, { limit: 6, horizonDays: 60 }),
    [recurringTransactions]
  );

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

      <section className="panel recurring-forecast-panel">
        <div className="dashboard-section-header">
          <div>
            <h2>Upcoming recurring dates</h2>
            <p>The next active income and outgoing items expected from your saved recurring setup.</p>
          </div>
          <RefreshCw size={20} />
        </div>
        {upcomingOccurrences.length === 0 ? (
          <p className="empty-inline">No upcoming recurring items in the next 60 days.</p>
        ) : (
          <div className="recurring-forecast-list" aria-label="Upcoming recurring dates">
            {upcomingOccurrences.map(({ id, item, date, daysAway }) => (
              <article key={id} className="recurring-forecast-row">
                <div className={`forecast-date-chip forecast-date-${item.type === 'income' ? 'income' : 'outgoing'}`}>
                  <strong>{formatForecastDate(date)}</strong>
                  <span>{daysAway === 0 ? 'Today' : `In ${daysAway} day${daysAway === 1 ? '' : 's'}`}</span>
                </div>
                <div>
                  <h3>{item.description}</h3>
                  <p>{item.category} - {item.frequency || 'monthly'}</p>
                </div>
                <b>{formatCurrency(Number(item.amount || 0), currency)}</b>
              </article>
            ))}
          </div>
        )}
      </section>

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
