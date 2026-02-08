import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function KPICards({ balance, monthlyIncome, monthlyExpenses, currency = 'USD' }) {
  return (
    <div className="kpi-grid">
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

      <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
        <div className="kpi-icon-small icon-blue">
          <TrendingUp />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Monthly Income</span>
          <h2 className="kpi-value">
            {formatCurrency(monthlyIncome, currency)}
          </h2>
        </div>
      </div>

      <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
        <div className="kpi-icon-small icon-red">
          <TrendingDown />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Monthly Expenses</span>
          <h2 className="kpi-value">
            {formatCurrency(monthlyExpenses, currency)}
          </h2>
        </div>
      </div>
    </div>
  );
}
