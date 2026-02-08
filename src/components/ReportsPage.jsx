import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download,
  BarChart3,
  PieChart,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { exportToCSV, exportGoalsToCSV, exportBudgetsToCSV } from '../utils/export';
import SpendingPieChart from './SpendingPieChart';

export default function ReportsPage({ 
  transactions, 
  goals, 
  budgets,
  currentMonthSpending,
  currency = 'USD' 
}) {
  const [period, setPeriod] = useState('month'); // month, quarter, year, all
  
  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth();
      const tQuarter = Math.floor(tMonth / 3);
      
      switch (period) {
        case 'month':
          return tYear === currentYear && tMonth === currentMonth;
        case 'quarter':
          return tYear === currentYear && tQuarter === currentQuarter;
        case 'year':
          return tYear === currentYear;
        case 'all':
        default:
          return true;
      }
    });
  }, [transactions, period]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    
    // Category breakdown
    const categoryBreakdown = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });
    
    // Top spending categories
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    // Average transaction
    const avgTransaction = expenses > 0 
      ? expenses / filteredTransactions.filter(t => t.type === 'expense').length 
      : 0;
    
    return {
      income,
      expenses,
      savings,
      savingsRate,
      categoryBreakdown,
      topCategories,
      avgTransaction,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);
  
  // Month-over-month comparison
  const monthComparison = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    const thisMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });
    
    const lastMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
    });
    
    const thisMonthExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const change = lastMonthExpenses > 0 
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0;
    
    return {
      thisMonth: thisMonthExpenses,
      lastMonth: lastMonthExpenses,
      change,
      isIncrease: change > 0
    };
  }, [transactions]);
  
  const handleExport = (type) => {
    let success = false;
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (type) {
      case 'transactions':
        success = exportToCSV(filteredTransactions, `transactions-${timestamp}.csv`);
        break;
      case 'goals':
        success = exportGoalsToCSV(goals, `goals-${timestamp}.csv`);
        break;
      case 'budgets':
        success = exportBudgetsToCSV(budgets, currentMonthSpending, `budgets-${timestamp}.csv`);
        break;
      default:
        break;
    }
    
    return success;
  };
  
  const getPeriodLabel = () => {
    switch (period) {
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      case 'all': return 'All Time';
      default: return '';
    }
  };
  
  return (
    <div>
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary" size={28} />
            <h2 className="text-2xl font-light">Financial Reports</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleExport('transactions')}
            className="btn btn-primary text-sm"
            disabled={filteredTransactions.length === 0}
          >
            <Download size={16} />
            Export Transactions CSV
          </button>
          <button
            onClick={() => handleExport('goals')}
            className="btn text-sm"
            disabled={goals.length === 0}
          >
            <Download size={16} />
            Export Goals CSV
          </button>
          <button
            onClick={() => handleExport('budgets')}
            className="btn text-sm"
            disabled={Object.keys(budgets).length === 0}
          >
            <Download size={16} />
            Export Budgets CSV
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="kpi-grid mb-6">
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="kpi-icon-small icon-green">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Income</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.income, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{getPeriodLabel()}</div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="kpi-icon-small icon-red">
              <TrendingDown size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Expenses</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.expenses, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{getPeriodLabel()}</div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`kpi-icon-small ${stats.savings >= 0 ? 'icon-blue' : 'icon-red'}`}>
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Net Savings</span>
          </div>
          <div className={`text-2xl font-bold ${stats.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(stats.savings), currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.savingsRate.toFixed(1)}% savings rate
          </div>
        </div>
      </div>
      
      {/* Month Comparison */}
      <div className="card mb-6">
        <h3 className="text-xl font-semibold mb-4">Month-over-Month</h3>
        <div className="grid grid-2 gap-6">
          <div>
            <div className="text-sm text-slate-600 mb-1">This Month</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(monthComparison.thisMonth, currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Last Month</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(monthComparison.lastMonth, currency)}
            </div>
          </div>
        </div>
        <div className={`mt-4 p-4 rounded-lg ${
          monthComparison.isIncrease ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <div className={`flex items-center gap-2 ${
            monthComparison.isIncrease ? 'text-red-600' : 'text-green-600'
          }`}>
            {monthComparison.isIncrease ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="font-semibold">
              {Math.abs(monthComparison.change).toFixed(1)}% {monthComparison.isIncrease ? 'increase' : 'decrease'}
            </span>
            <span className="text-sm">in spending from last month</span>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-2 gap-6 mb-6">
        <SpendingPieChart 
          spendingByCategory={stats.categoryBreakdown} 
          currency={currency}
        />
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Top Spending Categories</h3>
          {stats.topCategories.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              No expenses in this period
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topCategories.map(([category, amount], index) => {
                const percentage = (amount / stats.expenses) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">{category}</span>
                      <span className="font-semibold text-slate-900">
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
          )}
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Additional Insights</h3>
        <div className="grid grid-3 gap-6">
          <div>
            <div className="text-sm text-slate-600 mb-1">Average Transaction</div>
            <div className="text-xl font-bold text-slate-900">
              {formatCurrency(stats.avgTransaction, currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Total Transactions</div>
            <div className="text-xl font-bold text-slate-900">
              {stats.transactionCount}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Categories Used</div>
            <div className="text-xl font-bold text-slate-900">
              {Object.keys(stats.categoryBreakdown).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
