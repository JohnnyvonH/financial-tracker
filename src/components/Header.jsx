import React from 'react';
import { Plus, Target } from 'lucide-react';

export default function Header({ view, setView, onClearData }) {
  return (
    <div className="header">
      <div className="header-content">
        <div>
          <h1 className="header-font">
            Financial Dashboard
          </h1>
          <p>
            Track your wealth, achieve your goals
          </p>
        </div>
        <div className="nav-buttons">
          <button
            onClick={() => setView('dashboard')}
            className={`btn ${view === 'dashboard' ? 'btn-primary' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('add-transaction')}
            className="btn"
          >
            <Plus size={18} />
            Add Transaction
          </button>
          <button
            onClick={() => setView('add-goal')}
            className="btn"
          >
            <Target size={18} />
            New Goal
          </button>
          <button
            onClick={onClearData}
            className="btn btn-danger"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
