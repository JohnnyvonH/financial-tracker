import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Tag, X, Search, Filter } from 'lucide-react';

export default function TransactionsPage({ transactions, onDeleteTransaction }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [filterCategory, setFilterCategory] = useState('all');

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

  // Get unique categories
  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (transactions.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-light mb-6">All Transactions</h2>
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
    <div>
      {/* Summary Cards */}
      <div className="grid-3 mb-6">
        <div className="card" style={{ padding: '1.5rem', marginBottom: 0 }}>
          <div className="text-sm text-slate-600 mb-1">Filtered Income</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', marginBottom: 0 }}>
          <div className="text-sm text-slate-600 mb-1">Filtered Expenses</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', marginBottom: 0 }}>
          <div className="text-sm text-slate-600 mb-1">Net</div>
          <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-light mb-6">All Transactions</h2>

        {/* Filters */}
        <div className="filters-section">
          {/* Search */}
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <Tag size={18} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-slate-600 mb-4">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            No transactions match your filters.
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="transaction-item animate-slide-in"
                style={{ animationDelay: `${Math.min(index * 0.02, 0.6)}s` }}
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
        )}
      </div>
    </div>
  );
}
