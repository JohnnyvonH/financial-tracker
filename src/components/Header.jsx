import React from 'react';
import { Home, Plus, DollarSign, TrendingUp, Settings, List, RefreshCw, BarChart3 } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import AuthButton from './AuthButton';

export default function Header({ view, setView, isDarkMode, onToggleDarkMode }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const actionButtons = [
    { id: 'add-transaction', label: 'Transaction', icon: Plus },
    { id: 'add-goal', label: 'Goal', icon: TrendingUp },
    { id: 'add-recurring', label: 'Recurring', icon: RefreshCw },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="header-logo">
            <div className="header-logo-icon">
              <DollarSign size={24} />
            </div>
            <span className="header-logo-text">Financial Tracker</span>
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`nav-button ${
                  view === item.id ? 'nav-button-active' : ''
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-actions">
          <AuthButton onSignInClick={() => setView('auth')} />
          
          {actionButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={() => setView(button.id)}
                className="btn btn-primary btn-sm"
              >
                <Icon size={16} />
                <span className="hidden md:inline">{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
