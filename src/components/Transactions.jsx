import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Tag, X } from 'lucide-react';

export default function Transactions({ transactions, onDeleteTransaction }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="section-title">
          Recent Transactions
        </h2>
        <div className="stat-card rounded-2xl shadow-xl empty-state">
          <DollarSign size={48} />
          <p>
            No transactions yet. Add your first transaction to start tracking!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">
        Recent Transactions
      </h2>
      <div className="stat-card rounded-2xl shadow-xl">
        <div className="transaction-list">
          {transactions.slice(0, 20).map((transaction, index) => (
            <div
              key={transaction.id}
              className="transaction-item animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="transaction-left">
                <div
                  className={`transaction-icon ${
                    transaction.type === 'income' ? 'icon-green' : 'icon-red'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp />
                  ) : (
                    <TrendingDown />
                  )}
                </div>
                <div className="transaction-details">
                  <h4>{transaction.description}</h4>
                  <div className="transaction-meta">
                    <span>
                      <Calendar size={12} />
                      {formatDate(transaction.date)}
                    </span>
                    <span>
                      <Tag size={12} />
                      {transaction.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="transaction-right">
                <span
                  className={`transaction-amount ${
                    transaction.type === 'income' ? 'amount-income' : 'amount-expense'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="btn-icon"
                  title="Delete transaction"
                >
                  <X />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
