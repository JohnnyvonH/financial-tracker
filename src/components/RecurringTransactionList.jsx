import React from 'react';
import { RefreshCw, Calendar, Tag, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';
import { getFrequencyLabel } from '../utils/recurring';

export default function RecurringTransactionList({ 
  recurringTransactions, 
  onDelete, 
  onToggleActive,
  currency = 'USD' 
}) {
  if (recurringTransactions.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-light mb-6">Recurring Transactions</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <RefreshCw size={48} />
          </div>
          <p className="text-slate-600">
            No recurring transactions yet. Set up automatic income or expenses!
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Recurring Transactions</h2>
        </div>
        <span className="text-sm text-slate-600">
          {recurringTransactions.length} active
        </span>
      </div>

      <div className="space-y-3">
        {recurringTransactions.map((recurring, index) => {
          const categoryInfo = getCategoryIcon(recurring.category);
          const CategoryIcon = categoryInfo.icon;
          const isExpiringSoon = recurring.endDate && 
            new Date(recurring.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          return (
            <div
              key={recurring.id}
              className={`transaction-item animate-slide-in ${
                !recurring.active ? 'opacity-50' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="transaction-left">
                <div
                  className="transaction-icon"
                  style={{ 
                    backgroundColor: `${categoryInfo.color}20`,
                    color: categoryInfo.color
                  }}
                >
                  <CategoryIcon size={20} />
                </div>
                <div className="transaction-details">
                  <div className="flex items-center gap-2">
                    <h4>{recurring.description}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {getFrequencyLabel(recurring.frequency)}
                    </span>
                    {!recurring.active && (
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        Paused
                      </span>
                    )}
                  </div>
                  <div className="transaction-meta">
                    <span>
                      <Calendar size={12} />
                      Next: {formatDate(recurring.nextDate)}
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
              <div className="transaction-right">
                <span
                  className={`transaction-amount ${
                    recurring.type === 'income' ? 'amount-income' : 'amount-expense'
                  }`}
                >
                  {recurring.type === 'income' ? '+' : '-'}
                  {formatCurrency(recurring.amount, currency)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleActive(recurring.id)}
                    className="btn-icon"
                    title={recurring.active ? 'Pause' : 'Resume'}
                  >
                    {recurring.active ? (
                      <span className="text-amber-600">⏸</span>
                    ) : (
                      <span className="text-green-600">▶</span>
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(recurring.id)}
                    className="btn-icon"
                    title="Delete recurring transaction"
                  >
                    <X />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
