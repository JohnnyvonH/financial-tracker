import React from 'react';
import { PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';

export default function SpendingChart({ transactions, currency = 'USD' }) {
  // Get last 30 days expenses by category
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  const last30DaysExpenses = transactions.filter(t => {
    const tDate = new Date(t.date);
    return t.type === 'expense' && tDate >= thirtyDaysAgo && tDate <= now;
  });

  // Group by category
  const categoryData = {};
  last30DaysExpenses.forEach(transaction => {
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
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Spending by Category</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <PieChart size={48} />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            No expenses in the last 30 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="text-primary" size={28} />
        <h2 className="text-2xl font-light">Spending by Category (Last 30 Days)</h2>
      </div>
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
                      color: categoryInfo.color,
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <CategoryIcon size={18} />
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {percentage}%
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
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
      <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-secondary)' }} className="font-medium">
            Total Spending
          </span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(totalSpending, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
