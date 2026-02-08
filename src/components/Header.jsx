import React from 'react';
import { Plus, Target } from 'lucide-react';

export default function Header({ view, setView, onClearData }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold header-font text-slate-800 mb-1">
              Financial Dashboard
            </h1>
            <p className="text-slate-500 font-light">
              Track your wealth, achieve your goals
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setView('dashboard')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                view === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('add-transaction')}
              className="px-5 py-2.5 rounded-lg font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Add Transaction
            </button>
            <button
              onClick={() => setView('add-goal')}
              className="px-5 py-2.5 rounded-lg font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-2"
            >
              <Target size={18} />
              New Goal
            </button>
            <button
              onClick={onClearData}
              className="px-5 py-2.5 rounded-lg font-medium bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all text-sm"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
