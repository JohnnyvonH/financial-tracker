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
      <div className="card">
        <h2 className="text-2xl font-light mb-6">
          Recent Transactions
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <DollarSign size={48} />
          </div>
          <p className="text-slate-600">
            No transactions yet. Add your first transaction to start tracking!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-light mb-6">
        Recent Transactions
      </h2>
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
  );
}
