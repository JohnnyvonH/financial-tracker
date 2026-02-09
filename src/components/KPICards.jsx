import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function KPICards({ balance, monthlyIncome, monthlyExpenses, last30DaysIncome, last30DaysExpenses, currency = 'USD' }) {
  return (
    <div className="space-y-4">
      {/* Balance Card - Full Width */}
      <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
        <div className="kpi-icon-small icon-green">
          <DollarSign />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Current Balance</span>
          <h2 className="kpi-value">
            {formatCurrency(balance, currency)}
          </h2>
        </div>
      </div>

      {/* Income Cards - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
          <div className="kpi-icon-small icon-blue">
            <TrendingUp />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">This Month's Income</span>
            <h2 className="kpi-value">
              {formatCurrency(monthlyIncome, currency)}
            </h2>
          </div>
        </div>

        <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
          <div className="kpi-icon-small" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99, 102, 241)' }}>
            <Calendar />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Last 30 Days Income</span>
            <h2 className="kpi-value">
              {formatCurrency(last30DaysIncome, currency)}
            </h2>
          </div>
        </div>
      </div>

      {/* Expense Cards - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
          <div className="kpi-icon-small icon-red">
            <TrendingDown />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">This Month's Expenses</span>
            <h2 className="kpi-value">
              {formatCurrency(monthlyExpenses, currency)}
            </h2>
          </div>
        </div>

        <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
          <div className="kpi-icon-small" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}>
            <Calendar />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Last 30 Days Expenses</span>
            <h2 className="kpi-value">
              {formatCurrency(last30DaysExpenses, currency)}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
