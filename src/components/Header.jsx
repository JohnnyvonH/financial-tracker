import React from 'react';
import { Home, Plus, Target, PieChart, List, Settings } from 'lucide-react';

export default function Header({ view, setView }) {
  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1 className="header-font">Financial Tracker</h1>
          <p>Take control of your finances</p>
        </div>
        <nav className="nav-buttons">
          <button
            onClick={() => setView('dashboard')}
            className={`btn ${view === 'dashboard' ? 'btn-primary' : ''}`}
          >
            <Home size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setView('transactions')}
            className={`btn ${view === 'transactions' ? 'btn-primary' : ''}`}
          >
            <List size={18} />
            Transactions
          </button>
          <button
            onClick={() => setView('budget')}
            className={`btn ${view === 'budget' ? 'btn-primary' : ''}`}
          >
            <PieChart size={18} />
            Budget & Analytics
          </button>
          <button
            onClick={() => setView('add-transaction')}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Add Transaction
          </button>
          <button
            onClick={() => setView('add-goal')}
            className="btn btn-primary"
          >
            <Target size={18} />
            Add Goal
          </button>
          <button
            onClick={() => setView('settings')}
            className={`btn ${view === 'settings' ? 'btn-primary' : ''}`}
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>
      </div>
    </header>
  );
}
