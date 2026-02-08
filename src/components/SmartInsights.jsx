import React from 'react';
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { generateInsights } from '../utils/insights';

export default function SmartInsights({ transactions, budgets, currency = 'USD' }) {
  const insights = generateInsights(transactions, budgets);

  if (insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle size={20} />;
      case 'success': return <CheckCircle size={20} />;
      case 'tip': return <Lightbulb size={20} />;
      case 'increase': return <TrendingUp size={20} />;
      case 'decrease': return <TrendingDown size={20} />;
      default: return <Brain size={20} />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'tip': return 'info';
      case 'increase': return 'danger';
      case 'decrease': return 'success';
      default: return 'primary';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="text-primary" size={28} />
        <h2 className="text-2xl font-light">Smart Insights</h2>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const colorClass = getInsightColor(insight.type);
          
          return (
            <div
              key={index}
              className="insight-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className={`insight-icon insight-icon-${colorClass}`}
                  style={{
                    backgroundColor: `var(--${colorClass === 'info' ? 'accent' : colorClass}, #10b981)20`,
                    color: `var(--${colorClass === 'info' ? 'accent' : colorClass}, #10b981)`
                  }}
                >
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {insight.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {insight.message}
                  </p>
                  {insight.action && (
                    <button 
                      className="insight-action-btn mt-2"
                      onClick={insight.action.onClick}
                    >
                      {insight.action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
