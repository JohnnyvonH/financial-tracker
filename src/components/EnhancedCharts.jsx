import React, { useState } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';
import {
  getMonthlyTrends,
  getCategoryBreakdown,
  getIncomeVsExpenses,
  getDailySpending
} from '../utils/chartData';

export default function EnhancedCharts({ transactions, currency = 'USD' }) {
  const [activeChart, setActiveChart] = useState('trends');

  const monthlyTrends = getMonthlyTrends(transactions);
  const categoryBreakdown = getCategoryBreakdown(transactions);
  const incomeVsExpenses = getIncomeVsExpenses(transactions);
  const dailySpending = getDailySpending(transactions);

  const chartTabs = [
    { id: 'trends', label: 'Monthly Trends', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: PieChartIcon },
    { id: 'comparison', label: 'Income vs Expenses', icon: BarChart3 },
    { id: 'daily', label: 'Daily Activity', icon: CalendarIcon }
  ];

  const renderMonthlyTrends = () => {
    if (monthlyTrends.length === 0) {
      return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No data available</div>;
    }

    const maxAmount = Math.max(...monthlyTrends.map(m => Math.max(m.income, m.expenses)));

    return (
      <div className="space-y-6">
        {monthlyTrends.map((month, index) => (
          <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{month.month}</h4>
              <span className="text-sm" style={{ color: month.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                Net: {formatCurrency(month.net, currency)}
              </span>
            </div>
            
            <div className="space-y-2">
              {/* Income Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Income</span>
                  <span style={{ color: 'var(--success)' }} className="font-semibold">
                    {formatCurrency(month.income, currency)}
                  </span>
                </div>
                <div className="progress-bar" style={{ height: '1rem' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(month.income / maxAmount) * 100}%`,
                      background: 'linear-gradient(90deg, #10b981, #059669)'
                    }}
                  />
                </div>
              </div>

              {/* Expenses Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Expenses</span>
                  <span style={{ color: 'var(--danger)' }} className="font-semibold">
                    {formatCurrency(month.expenses, currency)}
                  </span>
                </div>
                <div className="progress-bar" style={{ height: '1rem' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(month.expenses / maxAmount) * 100}%`,
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCategoryPieChart = () => {
    if (categoryBreakdown.length === 0) {
      return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No expenses to display</div>;
    }

    const total = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
    let currentAngle = 0;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* SVG Donut Chart */}
        <div className="flex justify-center">
          <svg width="280" height="280" viewBox="0 0 280 280" className="chart-svg">
            <circle cx="140" cy="140" r="100" fill="var(--bg-secondary)" />
            {categoryBreakdown.map((cat, index) => {
              const percentage = (cat.amount / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              const x1 = 140 + 100 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 140 + 100 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 140 + 100 * Math.cos((currentAngle - 90) * Math.PI / 180);
              const y2 = 140 + 100 * Math.sin((currentAngle - 90) * Math.PI / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M 140 140`,
                `L ${x1} ${y1}`,
                `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={cat.color}
                  opacity="0.8"
                  className="chart-segment"
                />
              );
            })}
            <circle cx="140" cy="140" r="60" fill="var(--card-bg)" />
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {categoryBreakdown.map((cat, index) => {
            const percentage = ((cat.amount / total) * 100).toFixed(1);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '0.25rem',
                      background: cat.color
                    }}
                  />
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    {percentage}%
                  </span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-semibold">
                    {formatCurrency(cat.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderIncomeVsExpenses = () => {
    if (incomeVsExpenses.length === 0) {
      return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No data available</div>;
    }

    const maxValue = Math.max(...incomeVsExpenses.map(m => Math.max(m.income, m.expenses)));

    return (
      <div className="space-y-4">
        {incomeVsExpenses.map((month, index) => (
          <div
            key={index}
            className="p-4 rounded-lg"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{month.month}</h4>
              <div className="flex gap-4 text-sm">
                <span style={{ color: 'var(--success)' }}>↑ {formatCurrency(month.income, currency)}</span>
                <span style={{ color: 'var(--danger)' }}>↓ {formatCurrency(month.expenses, currency)}</span>
              </div>
            </div>
            
            <div className="flex gap-2" style={{ height: '8rem' }}>
              {/* Income Column */}
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-t-lg transition-all"
                  style={{
                    height: `${(month.income / maxValue) * 100}%`,
                    background: 'linear-gradient(180deg, #10b981, #059669)',
                    minHeight: '0.5rem'
                  }}
                />
              </div>
              
              {/* Expenses Column */}
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-t-lg transition-all"
                  style={{
                    height: `${(month.expenses / maxValue) * 100}%`,
                    background: 'linear-gradient(180deg, #ef4444, #dc2626)',
                    minHeight: '0.5rem'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDailyActivity = () => {
    if (dailySpending.length === 0) {
      return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No recent activity</div>;
    }

    return (
      <div className="space-y-2">
        {dailySpending.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{day.date}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {day.transactionCount} {day.transactionCount === 1 ? 'transaction' : 'transactions'}
              </div>
            </div>
            <div className="text-right">
              {day.income > 0 && (
                <div style={{ color: 'var(--success)' }} className="font-semibold">
                  +{formatCurrency(day.income, currency)}
                </div>
              )}
              {day.expenses > 0 && (
                <div style={{ color: 'var(--danger)' }} className="font-semibold">
                  -{formatCurrency(day.expenses, currency)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-primary" size={28} />
        <h2 className="text-2xl font-light">Financial Analytics</h2>
      </div>

      {/* Chart Type Tabs */}
      <div className="chart-tabs mb-6">
        {chartTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`chart-tab ${activeChart === tab.id ? 'chart-tab-active' : ''}`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Chart */}
      <div className="chart-container">
        {activeChart === 'trends' && renderMonthlyTrends()}
        {activeChart === 'categories' && renderCategoryPieChart()}
        {activeChart === 'comparison' && renderIncomeVsExpenses()}
        {activeChart === 'daily' && renderDailyActivity()}
      </div>
    </div>
  );
}
