# 🔧 Integration Guide - New Features

This guide shows you how to integrate all the new features into your Financial Tracker app.

## 📝 Step 1: Import New CSS

Add this to your `src/index.js` or `src/App.jsx`:

```javascript
import './styles/index.css';
import './styles/new-features.css'; // Add this line
```

---

## 📝 Step 2: Update App.jsx

Here's the complete updated `App.jsx` with all new features:

```javascript
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import Goals from './components/Goals';
import Reports from './components/Reports';
import RecurringTransactions from './components/RecurringTransactions';
import DataManagement from './components/DataManagement';
import QuickAddFAB from './components/QuickAddFAB';  // NEW
import EnhancedCharts from './components/EnhancedCharts';  // NEW
import CalendarView from './components/CalendarView';  // NEW
import CSVImport from './components/CSVImport';  // NEW
import './styles/index.css';
import './styles/new-features.css';  // NEW

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [currency, setCurrency] = useState('USD');

  // Load data from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedBudgets = localStorage.getItem('budgets');
    const savedGoals = localStorage.getItem('goals');
    const savedRecurring = localStorage.getItem('recurringTransactions');
    const savedCurrency = localStorage.getItem('currency');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedRecurring) setRecurringTransactions(JSON.parse(savedRecurring));
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('recurringTransactions', JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Transaction handlers
  const handleAddTransaction = (transaction) => {
    setTransactions([...transactions, { ...transaction, id: Date.now() }]);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // CSV Import handler (NEW)
  const handleCSVImport = (importedTransactions) => {
    setTransactions([...transactions, ...importedTransactions]);
    alert(`Successfully imported ${importedTransactions.length} transactions!`);
  };

  // Budget handlers
  const handleAddBudget = (budget) => {
    const existing = budgets.find(b => b.category === budget.category);
    if (existing) {
      setBudgets(budgets.map(b => 
        b.category === budget.category ? { ...b, amount: budget.amount } : b
      ));
    } else {
      setBudgets([...budgets, budget]);
    }
  };

  const handleDeleteBudget = (category) => {
    setBudgets(budgets.filter(b => b.category !== category));
  };

  // Goal handlers
  const handleAddGoal = (goal) => {
    setGoals([...goals, { ...goal, id: Date.now() }]);
  };

  const handleUpdateGoal = (id, current) => {
    setGoals(goals.map(g => g.id === id ? { ...g, current } : g));
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // Recurring transaction handlers
  const handleAddRecurring = (recurring) => {
    setRecurringTransactions([...recurringTransactions, { ...recurring, id: Date.now() }]);
  };

  const handleDeleteRecurring = (id) => {
    setRecurringTransactions(recurringTransactions.filter(r => r.id !== id));
  };

  // Data management
  const handleExport = () => {
    const data = {
      transactions,
      budgets,
      goals,
      recurringTransactions,
      currency,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (window.confirm('This will replace all current data. Continue?')) {
          setTransactions(data.transactions || []);
          setBudgets(data.budgets || []);
          setGoals(data.goals || []);
          setRecurringTransactions(data.recurringTransactions || []);
          setCurrency(data.currency || 'USD');
          alert('Data imported successfully!');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure? This will delete ALL data permanently!')) {
      if (window.confirm('This cannot be undone. Are you absolutely sure?')) {
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setRecurringTransactions([]);
        localStorage.clear();
        alert('All data has been cleared.');
      }
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            currency={currency}
          />
        );
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            currency={currency}
          />
        );
      case 'budget':
        return (
          <Budget
            transactions={transactions}
            budgets={budgets}
            onAddBudget={handleAddBudget}
            onDeleteBudget={handleDeleteBudget}
            currency={currency}
          />
        );
      case 'goals':
        return (
          <Goals
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            currency={currency}
          />
        );
      case 'reports':
        return (
          <Reports
            transactions={transactions}
            currency={currency}
          />
        );
      // NEW: Enhanced Charts Page
      case 'charts':
        return (
          <EnhancedCharts
            transactions={transactions}
            currency={currency}
          />
        );
      // NEW: Calendar Page
      case 'calendar':
        return (
          <CalendarView
            transactions={transactions}
            currency={currency}
          />
        );
      // NEW: CSV Import Page
      case 'csv-import':
        return (
          <CSVImport
            onImport={handleCSVImport}
            onClose={() => setCurrentPage('transactions')}
          />
        );
      case 'recurring':
        return (
          <RecurringTransactions
            recurringTransactions={recurringTransactions}
            onAddRecurring={handleAddRecurring}
            onDeleteRecurring={handleDeleteRecurring}
            currency={currency}
          />
        );
      case 'settings':
        return (
          <DataManagement
            onExport={handleExport}
            onImport={handleImport}
            onClearAll={handleClearAll}
            currency={currency}
            onCurrencyChange={handleCurrencyChange}
          />
        );
      default:
        return <Dashboard transactions={transactions} budgets={budgets} goals={goals} currency={currency} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="container">
        {renderPage()}
      </div>
      {/* NEW: Quick Add FAB - shows on all pages */}
      <QuickAddFAB onAddTransaction={handleAddTransaction} currency={currency} />
    </div>
  );
}

export default App;
```

---

## 📝 Step 3: Update Header.jsx

Add ThemeToggle to your header:

```javascript
import React from 'react';
import { 
  Home, 
  Receipt, 
  PieChart, 
  Target, 
  BarChart3,
  Calendar,  // NEW
  FileText,  // NEW
  Repeat, 
  Settings 
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';  // NEW

function Header({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'charts', label: 'Charts', icon: BarChart3 },  // NEW
    { id: 'calendar', label: 'Calendar', icon: Calendar },  // NEW
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="header-logo">
            <div className="header-logo-icon">
              <PieChart size={24} />
            </div>
            <span className="header-logo-text">Financial Tracker</span>
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-button ${
                  currentPage === item.id ? 'nav-button-active' : ''
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-actions">
          {/* NEW: Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
```

---

## 📝 Step 4: Add CSV Import Button to Settings

Update your `DataManagement.jsx` to include a link to CSV import:

```javascript
// Add this button in your Settings/DataManagement component
<button 
  onClick={() => window.location.href = '#csv-import'} // Or use your navigation
  className="btn btn-primary text-sm"
>
  <FileText className="w-4 h-4" />
  Import from CSV
</button>
```

---

## ✅ Verification Checklist

After integration, verify:

- [ ] Settings page has dark theme (no bright white backgrounds)
- [ ] Goal creation form matches transaction form styling
- [ ] Theme toggle appears in header
- [ ] Clicking theme toggle switches between light/dark
- [ ] Quick Add FAB appears in bottom-right
- [ ] Charts page shows 4 tab options
- [ ] Calendar page displays monthly view
- [ ] CSV import page is accessible
- [ ] All new features work without errors

---

## 🎯 Quick Test

1. **Theme Toggle**: Click sun/moon icon in header
2. **Quick Add**: Click "+" button in bottom-right
3. **Charts**: Navigate to Charts page, try all 4 tabs
4. **Calendar**: Navigate to Calendar, click a day with transactions
5. **CSV Import**: Go to Settings or CSV Import page, try sample CSV

---

## 🐛 Troubleshooting

### Theme toggle not working?
- Make sure `new-features.css` is imported
- Check browser console for errors
- Verify ThemeToggle component is imported in Header

### Charts not displaying?
- Check if transactions exist
- Verify chartData.js utility is imported
- Check browser console for calculation errors

### CSV import failing?
- Ensure CSV has correct format (Date, Description, Amount)
- Check csvParser.js for parsing logic
- Verify file is actually .csv format

### Quick Add FAB not appearing?
- Check if QuickAddFAB component is in App.jsx
- Verify it's outside the container div (should be at App root level)
- Check z-index in CSS (should be 999)

---

## 🚀 You're All Set!

Your Financial Tracker now has:
- ✅ Fixed Settings styling
- ✅ Fixed Goal form styling
- ✅ Enhanced Charts
- ✅ Calendar View
- ✅ Theme Toggle
- ✅ CSV Import
- ✅ Quick Add FAB

**Enjoy your professional-grade financial tracker! 💰📊**
