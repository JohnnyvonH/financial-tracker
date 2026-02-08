import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function BudgetWarnings({ budgets, currentMonthSpending, currency = 'USD' }) {
  const warnings = [];

  Object.entries(budgets).forEach(([category, budgetAmount]) => {
    const spent = currentMonthSpending[category] || 0;
    const percentage = (spent / budgetAmount) * 100;

    if (percentage >= 75) {
      warnings.push({
        category,
        spent,
        budget: budgetAmount,
        percentage,
        remaining: budgetAmount - spent,
        isOver: percentage > 100
      });
    }
  });

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-warning" size={28} />
          <h2 className="text-2xl font-light">Budget Alerts</h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-warning/20 text-warning rounded-full">
          {warnings.length} {warnings.length === 1 ? 'Alert' : 'Alerts'}
        </span>
      </div>

      <div className="space-y-3">
        {warnings.map((warning) => (
          <div
            key={warning.category}
            className="budget-warning-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  warning.isOver ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                }`}>
                  {warning.isOver ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{warning.category}</h3>
                  <p className="text-sm text-slate-600">
                    {formatCurrency(warning.spent, currency)} of {formatCurrency(warning.budget, currency)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  warning.isOver ? 'text-danger' : 'text-warning'
                }`}>
                  {warning.percentage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-500 font-medium">Used</div>
              </div>
            </div>

            <div className="progress-bar mb-2">
              <div
                className={`progress-fill ${
                  warning.isOver ? 'bg-danger-gradient' : 'bg-warning-gradient'
                }`}
                style={{ width: `${Math.min(warning.percentage, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className={warning.isOver ? 'text-danger font-semibold' : 'text-warning font-semibold'}>
                {warning.isOver 
                  ? `${formatCurrency(Math.abs(warning.remaining), currency)} over budget` 
                  : `${formatCurrency(warning.remaining, currency)} remaining`}
              </span>
              <span className="text-slate-500">
                {warning.isOver ? 'Over budget!' : 'Approaching limit'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
