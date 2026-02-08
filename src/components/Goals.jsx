import React from 'react';
import { Target, X } from 'lucide-react';

export default function Goals({ goals, onUpdateGoal, onDeleteGoal }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (goals.length === 0) {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">
          Savings Goals
        </h2>
        <div className="stat-card rounded-2xl shadow-xl empty-state">
          <Target size={48} />
          <p>
            No goals yet. Set your first savings goal to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 className="section-title">
        Savings Goals
      </h2>
      <div className="grid grid-2">
        {goals.map((goal, index) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          return (
            <div
              key={goal.id}
              className="stat-card rounded-2xl shadow-xl card-hover animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s`, padding: '1.5rem' }}
            >
              <div className="goal-header">
                <h3 className="goal-name">{goal.name}</h3>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="btn-icon"
                  title="Delete goal"
                >
                  <X size={20} />
                </button>
              </div>
              <div>
                <div className="progress-info">
                  <div className="progress-amount">
                    <input
                      type="number"
                      step="0.01"
                      value={goal.current}
                      onChange={(e) => onUpdateGoal(goal.id, parseFloat(e.target.value) || 0)}
                      className="goal-current-input"
                    />
                    <span>/ {formatCurrency(goal.target)}</span>
                  </div>
                  <span className="progress-percent">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
