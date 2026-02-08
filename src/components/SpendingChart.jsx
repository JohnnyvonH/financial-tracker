import React from 'react';
import { PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';

export default function SpendingChart({ transactions, currency = 'USD' }) {
  // Get current month expenses by category
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthlyExpenses = transactions.filter(t => {
    const tDate = new Date(t.date);
    return t.type === 'expense' && 
           tDate.getMonth() === thisMonth && 
           tDate.getFullYear() === thisYear;
  });

  // Group by category
  const categoryData = {};
  monthlyExpenses.forEach(transaction => {
    const category = transaction.category || 'Other';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += transaction.amount;
  });

  // Convert to array and sort by amount
  const sortedCategories = Object.entries(categoryData)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6); // Top 6 categories

  const totalSpending = sortedCategories.reduce((sum, cat) => sum + cat.amount, 0);

  if (sortedCategories.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-light mb-6">Spending by Category</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <PieChart size={48} />
          </div>
          <p className="text-slate-600">
            No expenses this month yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-light mb-6">Spending by Category</h2>
      <div className="space-y-4">
        {sortedCategories.map((item, index) => {
          const percentage = (item.amount / totalSpending * 100).toFixed(1);
          const categoryInfo = getCategoryIcon(item.category);
          const CategoryIcon = categoryInfo.icon;
          
          return (
            <div key={item.category} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="kpi-icon-small"
                    style={{ 
                      backgroundColor: `${categoryInfo.color}20`,
                      color: categoryInfo.color
                    }}
                  >
                    <CategoryIcon size={18} />
                  </div>
                  <span className="font-medium text-slate-700">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{percentage}%</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ 
                    width: `${percentage}%`,
                    background: categoryInfo.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Total Spending</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(totalSpending, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
