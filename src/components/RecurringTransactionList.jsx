import React from 'react';
import { RefreshCw, Calendar, Tag, X, AlertCircle, Edit3, Pause, Play } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';
import { getFrequencyLabel } from '../utils/recurring';

export default function RecurringTransactionList({
  recurringTransactions,
  onDelete,
  onToggleActive,
  onEdit,
  currency = 'USD',
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (recurringTransactions.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-light mb-6">Recurring Transactions</h2>
        <div className="recurring-empty-state">
          <RefreshCw size={42} />
          <p>No recurring income or payments yet. Add salary, bills, subscriptions, and transfers here so the dashboard can forecast the month.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card recurring-list-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Recurring Transactions</h2>
        </div>
        <span className="text-sm text-slate-600">
          {recurringTransactions.filter((item) => item.active !== false).length} active
        </span>
      </div>

      <div className="recurring-table">
        {recurringTransactions.map((recurring) => {
          const categoryInfo = getCategoryIcon(recurring.category);
          const CategoryIcon = categoryInfo.icon;
          const nextDate = recurring.nextDate || recurring.startDate || recurring.start_date;
          const isExpiringSoon = recurring.endDate &&
            new Date(recurring.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          return (
            <article
              key={recurring.id}
              className={`recurring-row ${recurring.active === false ? 'recurring-row-paused' : ''}`}
            >
              <div className="recurring-main">
                <div
                  className="transaction-icon"
                  style={{
                    backgroundColor: `${categoryInfo.color}20`,
                    color: categoryInfo.color,
                  }}
                >
                  <CategoryIcon size={20} />
                </div>
                <div className="transaction-details">
                  <div className="recurring-title-line">
                    <h4>{recurring.description}</h4>
                    <span className="status-chip">{getFrequencyLabel(recurring.frequency)}</span>
                    {recurring.active === false && <span className="status-chip status-chip-muted">Paused</span>}
                  </div>
                  <div className="transaction-meta">
                    <span>
                      <Calendar size={12} />
                      Next: {formatDate(nextDate)}
                    </span>
                    <span>
                      <Tag size={12} />
                      {recurring.category}
                    </span>
                    {isExpiringSoon && recurring.endDate && (
                      <span className="text-amber-600">
                        <AlertCircle size={12} />
                        Ends {formatDate(recurring.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span
                className={`transaction-amount ${
                  recurring.type === 'income' ? 'amount-income' : 'amount-expense'
                }`}
              >
                {recurring.type === 'income' ? '+' : '-'}
                {formatCurrency(recurring.amount, currency)}
              </span>

              <div className="recurring-actions">
                <button
                  onClick={() => onToggleActive(recurring.id)}
                  className="btn-icon btn-icon-neutral"
                  title={recurring.active === false ? 'Resume' : 'Pause'}
                  aria-label={recurring.active === false ? `Resume ${recurring.description}` : `Pause ${recurring.description}`}
                >
                  {recurring.active === false ? <Play size={17} /> : <Pause size={17} />}
                </button>
                <button
                  onClick={() => onEdit(recurring)}
                  className="btn-icon btn-icon-neutral"
                  title="Edit recurring transaction"
                  aria-label={`Edit ${recurring.description}`}
                >
                  <Edit3 size={17} />
                </button>
                <button
                  onClick={() => onDelete(recurring.id)}
                  className="btn-icon"
                  title="Delete recurring transaction"
                  aria-label={`Delete ${recurring.description}`}
                >
                  <X size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
