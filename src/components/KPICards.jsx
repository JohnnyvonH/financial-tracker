import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICards({ balance, monthlyIncome, monthlyExpenses }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid grid-3">
      <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
        <div className="kpi-icon icon-green">
          <DollarSign />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Current Balance</span>
          <h2 className="kpi-value">
            {formatCurrency(balance)}
          </h2>
        </div>
      </div>

      <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
        <div className="kpi-icon icon-blue">
          <TrendingUp />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Monthly Income</span>
          <h2 className="kpi-value">
            {formatCurrency(monthlyIncome)}
          </h2>
        </div>
      </div>

      <div className="stat-card kpi-card rounded-xl shadow-xl card-hover">
        <div className="kpi-icon icon-red">
          <TrendingDown />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Monthly Expenses</span>
          <h2 className="kpi-value">
            {formatCurrency(monthlyExpenses)}
          </h2>
        </div>
      </div>
    </div>
  );
}
