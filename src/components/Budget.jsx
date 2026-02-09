import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import SpendingPieChart from './SpendingPieChart';
import BalanceLineChart from './BalanceLineChart';
import BudgetManager from './BudgetManager';

export default function Budget({ transactions, budgets, onUpdateBudgets, currency = 'USD' }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const categorySpending = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Other';
        categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
      });

    return categorySpending;
  };

  // Calculate balance over time
  const getBalanceOverTime = () => {
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    let runningBalance = 0;
    const balanceData = sortedTransactions.map(t => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      return {
        date: t.date,
        balance: runningBalance,
        label: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });

    return balanceData;
  };

  // Get current month spending
  const getCurrentMonthSpending = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const categorySpending = {};
    
    transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               tDate.getMonth() === thisMonth && 
               tDate.getFullYear() === thisYear;
      })
      .forEach(transaction => {
        const category = transaction.category || 'Other';
        categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
      });

    return categorySpending;
  };

  const spendingByCategory = getSpendingByCategory();
  const balanceOverTime = getBalanceOverTime();
  const currentMonthSpending = getCurrentMonthSpending();

  // Calculate total spending and income
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  return (
    <div>
      {/* Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="kpi-icon-small icon-blue">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(totalIncome, currency)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="kpi-icon-small icon-red">
              <TrendingDown size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(totalExpenses, currency)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`kpi-icon-small ${netSavings >= 0 ? 'icon-green' : 'icon-red'}`}>
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Net Savings</span>
          </div>
          <div className={`text-2xl font-bold ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(netSavings), currency)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="budget-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`budget-tab ${activeTab === 'overview' ? 'budget-tab-active' : ''}`}
        >
          <PieChart size={18} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`budget-tab ${activeTab === 'budgets' ? 'budget-tab-active' : ''}`}
        >
          <DollarSign size={18} />
          Budgets
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`budget-tab ${activeTab === 'trends' ? 'budget-tab-active' : ''}`}
        >
          <Activity size={18} />
          Trends
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <SpendingPieChart spendingByCategory={spendingByCategory} currency={currency} />
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Spending Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(spendingByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = (amount / totalExpenses) * 100;
                  return (
                    <div key={category} className="spending-item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-700" style={{ color: 'var(--text-primary)' }}>{category}</span>
                        <span className="text-slate-900 font-semibold">
                          {formatCurrency(amount, currency)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {percentage.toFixed(1)}% of total expenses
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budgets' && (
        <BudgetManager
          budgets={budgets}
          currentMonthSpending={currentMonthSpending}
          onUpdateBudgets={onUpdateBudgets}
          currency={currency}
        />
      )}

      {activeTab === 'trends' && (
        <div>
          <BalanceLineChart balanceData={balanceOverTime} currency={currency} />
        </div>
      )}
    </div>
  );
}
