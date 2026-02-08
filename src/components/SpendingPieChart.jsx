import React from 'react';
import { PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function SpendingPieChart({ spendingByCategory, currency = 'USD' }) {
  const categories = Object.entries(spendingByCategory);
  const totalSpending = categories.reduce((sum, [, amount]) => sum + amount, 0);

  // Color palette for categories
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#ef4444', // red
    '#64748b', // slate
  ];

  // Calculate SVG path for pie chart
  const createPieSlices = () => {
    if (categories.length === 0) return [];

    let currentAngle = -90; // Start from top
    const radius = 100;
    const center = 120;

    return categories.map(([category, amount], index) => {
      const percentage = (amount / totalSpending) * 100;
      const angle = (percentage / 100) * 360;
      
      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = ((currentAngle + angle) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      currentAngle += angle;

      return {
        path: pathData,
        color: colors[index % colors.length],
        category,
        amount,
        percentage
      };
    });
  };

  const slices = createPieSlices();

  if (categories.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Spending by Category</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <PieChart size={48} />
          </div>
          <p className="text-slate-600">No expense data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-6">Spending by Category</h3>
      
      <div className="flex flex-col items-center">
        <svg width="240" height="240" viewBox="0 0 240 240" className="mb-6">
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color}
                className="pie-slice"
                style={{ transition: 'all 0.3s ease' }}
              />
            </g>
          ))}
        </svg>

        <div className="w-full space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm font-medium text-slate-700">{slice.category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(slice.amount, currency)}
                </div>
                <div className="text-xs text-slate-500">
                  {slice.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
