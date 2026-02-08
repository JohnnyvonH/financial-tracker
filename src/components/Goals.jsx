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
      <div className="mb-8">
        <h2 className="text-2xl font-bold header-font text-slate-800 mb-4">
          Savings Goals
        </h2>
        <div className="stat-card rounded-2xl p-8 shadow-xl text-center">
          <Target className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-light">
            No goals yet. Set your first savings goal to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold header-font text-slate-800 mb-4">
        Savings Goals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal, index) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          return (
            <div
              key={goal.id}
              className="stat-card rounded-2xl p-6 shadow-xl card-hover animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-800">{goal.name}</h3>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete goal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={goal.current}
                      onChange={(e) => onUpdateGoal(goal.id, parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 rounded border border-slate-300 focus:border-emerald-500 focus:outline-none mr-1"
                    />
                    <span className="text-slate-600 font-medium">
                      / {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <span className="text-emerald-600 font-semibold">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 progress-bar rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.5);
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .progress-bar {
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
