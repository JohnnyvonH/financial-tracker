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
        <h2 className="text-2xl font-bold header-font text-slate-800 mb-4">
          Recent Transactions
        </h2>
        <div className="stat-card rounded-2xl p-8 shadow-xl text-center">
          <DollarSign className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-light">
            No transactions yet. Add your first transaction to start tracking!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold header-font text-slate-800 mb-4">
        Recent Transactions
      </h2>
      <div className="stat-card rounded-2xl shadow-xl overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {transactions.slice(0, 20).map((transaction, index) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    transaction.type === 'income' ? 'bg-emerald-100' : 'bg-rose-100'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="text-emerald-600" size={20} />
                  ) : (
                    <TrendingDown className="text-rose-600" size={20} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{transaction.description}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(transaction.date)}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Tag size={12} />
                      {transaction.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete transaction"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
}
