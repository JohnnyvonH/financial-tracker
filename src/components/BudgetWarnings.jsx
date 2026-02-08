import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export default function BudgetWarnings({ budgets, currentMonthSpending }) {
  // Calculate which budgets are at risk (>75% spent)
  const budgetsAtRisk = Object.entries(budgets)
    .map(([category, budgetAmount]) => {
      const spent = currentMonthSpending[category] || 0;
      const percentage = (spent / budgetAmount) * 100;
      const remaining = budgetAmount - spent;
      return {
        category,
        budgetAmount,
        spent,
        percentage,
        remaining,
        isOverBudget: spent > budgetAmount,
        isWarning: percentage >= 75 && percentage <= 100
      };
    })
    .filter(budget => budget.isOverBudget || budget.isWarning)
    .sort((a, b) => b.percentage - a.percentage);

  if (budgetsAtRisk.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-light mb-6">Budget Status</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-green-500 mb-3">
            <TrendingUp size={40} />
          </div>
          <p className="text-slate-700 font-medium mb-1">All budgets on track!</p>
          <p className="text-sm text-slate-600">
            You're managing your spending well this month.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light">Budget Alerts</h2>
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle size={20} />
          <span className="text-sm font-medium">{budgetsAtRisk.length} Alert{budgetsAtRisk.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-3">
        {budgetsAtRisk.map(budget => (
          <div
            key={budget.category}
            className={`budget-warning-item ${
              budget.isOverBudget ? 'budget-over' : 'budget-warning'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-slate-900">{budget.category}</h4>
                <div className="text-sm text-slate-600 mt-1">
                  ${budget.spent.toFixed(2)} of ${budget.budgetAmount.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  budget.isOverBudget ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {budget.percentage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600">
                  {budget.isOverBudget ? 'Over budget' : 'Used'}
                </div>
              </div>
            </div>

            <div className="progress-bar" style={{ height: '6px' }}>
              <div
                className={`progress-fill ${
                  budget.isOverBudget ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>

            <div className="mt-2">
              {budget.isOverBudget ? (
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ ${Math.abs(budget.remaining).toFixed(2)} over budget
                </p>
              ) : (
                <p className="text-sm text-amber-600 font-medium">
                  ⚠️ ${budget.remaining.toFixed(2)} remaining
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
