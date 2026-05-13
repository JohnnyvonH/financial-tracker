import React from 'react';
import { Target, X, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function Goals({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, currency = 'USD' }) {
  const handleManualCurrentChange = (goal, value) => {
    const nextCurrent = Math.max(0, Number(value || 0));

    if (Number.isNaN(nextCurrent) || nextCurrent === goal.current) {
      return;
    }

    onUpdateGoal(goal.id, nextCurrent);
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
        <div className="flex items-center gap-3 mb-6">
          <Target className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Savings Goals</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <Target size={48} />
          </div>
          <p className="text-slate-600">
            No goals yet. Set your first savings goal to get started!
          </p>
          <button type="button" className="btn btn-primary mt-6" onClick={onAddGoal}>
            <Plus size={16} />
            Add goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-primary" size={28} />
        <h2 className="text-2xl font-light">Savings Goals</h2>
      </div>
      <div className="goals-grid">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = progress >= 100;
          
          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <h3 className="goal-name" style={{ color: 'var(--text-primary)' }}>{goal.name}</h3>
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
                  <span className="goal-current">{formatCurrency(goal.current, currency)}</span>
                  <span className="goal-separator">/</span>
                  <span className="goal-target">{formatCurrency(goal.target, currency)}</span>
                </div>
                
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${isComplete ? 'bg-success' : ''}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="goal-progress-text">
                  <span className="font-semibold">{progress.toFixed(0)}% complete</span>
                  <span className="goal-remaining">
                    {formatCurrency(Math.max(0, goal.target - goal.current), currency)} remaining
                  </span>
                </div>

                <div className="goal-manual-entry">
                  <label htmlFor={`goal-current-${goal.id}`}>Current saved</label>
                  <input
                    id={`goal-current-${goal.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={goal.current}
                    onBlur={(event) => handleManualCurrentChange(goal, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.currentTarget.blur();
                      }
                    }}
                  />
                </div>
                
                <div className="goal-controls">
                  <button
                    onClick={() => handleDecrement(goal.id, goal.current, 100)}
                    className="goal-control-btn goal-control-minus"
                    title="Subtract 100"
                    disabled={goal.current === 0}
                  >
                    <Minus size={16} />
                    <span>100</span>
                  </button>
                  <button
                    onClick={() => handleDecrement(goal.id, goal.current, 10)}
                    className="goal-control-btn goal-control-minus"
                    title="Subtract 10"
                    disabled={goal.current === 0}
                  >
                    <Minus size={16} />
                    <span>10</span>
                  </button>
                  <button
                    onClick={() => handleIncrement(goal.id, goal.current, 10)}
                    className="goal-control-btn goal-control-plus"
                    title="Add 10"
                  >
                    <Plus size={16} />
                    <span>10</span>
                  </button>
                  <button
                    onClick={() => handleIncrement(goal.id, goal.current, 100)}
                    className="goal-control-btn goal-control-plus"
                    title="Add 100"
                  >
                    <Plus size={16} />
                    <span>100</span>
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
