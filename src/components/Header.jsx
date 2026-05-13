import React from 'react';
import { Home, DollarSign, TrendingUp, Settings, RefreshCw, BarChart3, CalendarClock, WalletCards, Moon, Sun, FileText, PlusCircle } from 'lucide-react';
import AuthButton from './AuthButton';

export default function Header({ view, setView, isDarkMode, onToggleDarkMode }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'recurring', label: 'Recurring', icon: RefreshCw },
    { id: 'plan', label: 'Plan', icon: CalendarClock },
    { id: 'goals', label: 'Goals', icon: TrendingUp },
    { id: 'budget', label: 'Budgets', icon: DollarSign },
    { id: 'snapshot', label: 'Current Finances', icon: WalletCards },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const actionButtons = [
    { id: 'snapshot', label: 'Current', icon: WalletCards },
    { id: 'add-transaction', label: 'Transaction', icon: PlusCircle },
    { id: 'add-goal', label: 'Goal', icon: TrendingUp },
    { id: 'add-recurring', label: 'Recurring', icon: RefreshCw },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="header-logo-icon">
          <WalletCards size={23} />
        </div>
        <div>
          <span className="header-logo-text">Financial Tracker</span>
          <small>{isDarkMode ? 'Dark workspace' : 'Light workspace'}</small>
        </div>
      </div>

      <nav className="header-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`nav-button ${view === item.id ? 'nav-button-active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-actions">
        <AuthButton onSignInClick={() => setView('auth')} />
        <div className="quick-action-stack">
          {actionButtons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.id}
              onClick={() => setView(button.id)}
              className="btn btn-primary btn-sm"
              aria-label={`Add ${button.label}`}
            >
              <Icon size={16} />
              <span>{button.label}</span>
            </button>
          );
        })}
        </div>
        <button
          type="button"
          className="sidebar-theme-toggle"
          onClick={onToggleDarkMode}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </aside>
  );
}
