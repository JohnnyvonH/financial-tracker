import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function KPICards({ balance, last30DaysIncome, last30DaysExpenses, currency = 'USD' }) {
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
          <span className="kpi-label">Income (Last 30 Days)</span>
          <h2 className="kpi-value">
            {formatCurrency(last30DaysIncome, currency)}
          </h2>
        </div>
      </div>

      <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
        <div className="kpi-icon-small icon-red">
          <TrendingDown />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Expenses (Last 30 Days)</span>
          <h2 className="kpi-value">
            {formatCurrency(last30DaysExpenses, currency)}
          </h2>
        </div>
      </div>
    </div>
  );
}
