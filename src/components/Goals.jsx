import React from 'react';
import { Target, X, Plus, Minus } from 'lucide-react';

export default function Goals({ goals, onUpdateGoal, onDeleteGoal }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleIncrement = (goalId, currentAmount, increment = 100) => {
    onUpdateGoal(goalId, currentAmount + increment);
  };

  const handleDecrement = (goalId, currentAmount, decrement = 100) => {
    const newAmount = Math.max(0, currentAmount - decrement);
    onUpdateGoal(goalId, newAmount);
  };

  if (goals.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-light mb-4">
          Savings Goals
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <Target size={48} />
          </div>
          <p className="text-slate-600">
            No goals yet. Set your first savings goal to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-light mb-6">
        Savings Goals
      </h2>
      <div className="goals-grid">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <h3 className="goal-name">{goal.name}</h3>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="goal-delete-btn"
                  title="Delete goal"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="goal-content">
                <div className="goal-amount-display">
                  <span className="goal-current">{formatCurrency(goal.current)}</span>
                  <span className="goal-separator">/</span>
                  <span className="goal-target">{formatCurrency(goal.target)}</span>
                </div>
                
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="goal-progress-text">
                  <span>{progress.toFixed(0)}% complete</span>
                  <span className="goal-remaining">
                    {formatCurrency(goal.target - goal.current)} remaining
                  </span>
                </div>
                
                <div className="goal-controls">
                  <button
                    onClick={() => handleDecrement(goal.id, goal.current, 100)}
                    className="goal-control-btn goal-control-minus"
                    title="Subtract $100"
                  >
                    <Minus size={16} />
                    <span>$100</span>
                  </button>
                  <button
                    onClick={() => handleDecrement(goal.id, goal.current, 10)}
                    className="goal-control-btn goal-control-minus"
                    title="Subtract $10"
                  >
                    <Minus size={16} />
                    <span>$10</span>
                  </button>
                  <button
                    onClick={() => handleIncrement(goal.id, goal.current, 10)}
                    className="goal-control-btn goal-control-plus"
                    title="Add $10"
                  >
                    <Plus size={16} />
                    <span>$10</span>
                  </button>
                  <button
                    onClick={() => handleIncrement(goal.id, goal.current, 100)}
                    className="goal-control-btn goal-control-plus"
                    title="Add $100"
                  >
                    <Plus size={16} />
                    <span>$100</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
