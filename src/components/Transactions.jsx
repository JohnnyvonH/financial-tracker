import React from 'react';
import { List, Calendar, Tag, X, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';

export default function Transactions({ transactions, onDeleteTransaction, onViewAll, currency = 'USD' }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Show only the 3 most recent transactions
  const recentTransactions = transactions.slice(0, 3);

  if (transactions.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <List className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Recent Transactions</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <List size={48} />
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <List className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Recent Transactions</h2>
        </div>
        {transactions.length > 3 && (
          <button
            onClick={onViewAll}
            className="btn btn-primary text-sm"
          >
            View All ({transactions.length})
            <ArrowRight size={16} />
          </button>
        )}
      </div>
      
      <div className="transaction-list">
        {recentTransactions.map((transaction, index) => {
          const categoryInfo = getCategoryIcon(transaction.category);
          const CategoryIcon = categoryInfo.icon;
          
          return (
            <div
              key={transaction.id}
              className="transaction-item animate-slide-in"
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
                  <h4 style={{ color: 'var(--text-primary)' }}>{transaction.description}</h4>
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
                  {formatCurrency(transaction.amount, currency)}
                </span>
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="btn-icon"
                  title="Delete transaction"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
