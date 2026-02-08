import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import KPICards from './components/KPICards';
import Goals from './components/Goals';
import Transactions from './components/Transactions';
import TransactionsPage from './components/TransactionsPage';
import TransactionForm from './components/TransactionForm';
import GoalForm from './components/GoalForm';
import Budget from './components/Budget';
import BudgetWarnings from './components/BudgetWarnings';
import SpendingChart from './components/SpendingChart';
import DataManagement from './components/DataManagement';
import RecurringTransactionForm from './components/RecurringTransactionForm';
import RecurringTransactionList from './components/RecurringTransactionList';
import ReportsPage from './components/ReportsPage';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import { storageService } from './services/storage';
import { processRecurringTransactions } from './utils/recurring';
import { getInitialTheme, saveTheme, applyTheme } from './utils/theme';

function App() {
  const [data, setData] = useState({
    balance: 0,
    transactions: [],
    goals: [],
    budgets: {},
    recurringTransactions: []
  });
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Load data and settings on mount
  useEffect(() => {
    try {
      const savedData = storageService.getData();
      // Ensure all fields exist
      if (!savedData.budgets) savedData.budgets = {};
      if (!savedData.recurringTransactions) savedData.recurringTransactions = [];
      setData(savedData);

      // Load settings
      const savedSettings = storageService.getSettings();
      setCurrency(savedSettings.currency || 'USD');
      
      // Load and apply theme
      const initialTheme = savedSettings.theme || getInitialTheme();
      setTheme(initialTheme);
      applyTheme(initialTheme);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data. Starting fresh.', 'error');
      setLoading(false);
    }
  }, []);

  // Process recurring transactions daily
  useEffect(() => {
    if (loading || data.recurringTransactions.length === 0) return;

    const processRecurring = () => {
      const { newTransactions, updatedRecurring } = processRecurringTransactions(
        data.recurringTransactions.filter(r => r.active)
      );

      if (newTransactions.length > 0) {
        // Update balance
        let newBalance = data.balance;
        newTransactions.forEach(t => {
          if (t.type === 'income') {
            newBalance += t.amount;
          } else {
            newBalance -= t.amount;
          }
        });

        // Save updated data
        const updatedData = {
          ...data,
          balance: newBalance,
          transactions: [...newTransactions, ...data.transactions],
          recurringTransactions: updatedRecurring
        };

        saveData(updatedData);
        showToast(
          `${newTransactions.length} recurring transaction${newTransactions.length > 1 ? 's' : ''} processed!`,
          'success'
        );
      }
    };

    processRecurring();
    // Check every hour
    const interval = setInterval(processRecurring, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loading, data.recurringTransactions]);

  // Save data whenever it changes
  const saveData = (newData) => {
    try {
      setData(newData);
      const success = storageService.saveData(newData);
      if (!success) {
        showToast('Failed to save data. Please try again.', 'error');
      }
      return success;
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('Error saving data. Please try again.', 'error');
      return false;
    }
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    try {
      setCurrency(newCurrency);
      const settings = storageService.getSettings();
      const success = storageService.saveSettings({ ...settings, currency: newCurrency });
      if (success) {
        showToast('Currency updated successfully!', 'success');
      } else {
        showToast('Failed to save currency setting.', 'error');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      showToast('Failed to update currency. Please try again.', 'error');
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    saveTheme(newTheme);
    
    const settings = storageService.getSettings();
    storageService.saveSettings({ ...settings, theme: newTheme });
    showToast(`Switched to ${newTheme} mode`, 'info');
  };

  // Add transaction
  const addTransaction = (transaction) => {
    try {
      const newTransaction = {
        id: Date.now(),
        ...transaction,
        timestamp: Date.now()
      };

      const newBalance = transaction.type === 'income'
        ? data.balance + transaction.amount
        : data.balance - transaction.amount;

      const success = saveData({
        ...data,
        balance: newBalance,
        transactions: [newTransaction, ...data.transactions]
      });

      if (success) {
        showToast(
          `${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully!`,
          'success'
        );
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showToast('Failed to add transaction. Please try again.', 'error');
    }
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const transaction = data.transactions.find(t => t.id === id);
      if (!transaction) {
        showToast('Transaction not found.', 'error');
        return;
      }

      const newBalance = transaction.type === 'income'
        ? data.balance - transaction.amount
        : data.balance + transaction.amount;

      const success = saveData({
        ...data,
        balance: newBalance,
        transactions: data.transactions.filter(t => t.id !== id)
      });

      if (success) {
        showToast('Transaction deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showToast('Failed to delete transaction. Please try again.', 'error');
    }
  };

  // Add recurring transaction
  const addRecurringTransaction = (recurring) => {
    try {
      const newRecurring = {
        id: Date.now(),
        ...recurring,
        createdAt: Date.now()
      };

      const success = saveData({
        ...data,
        recurringTransactions: [...data.recurringTransactions, newRecurring]
      });

      if (success) {
        showToast('Recurring transaction created successfully!', 'success');
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      showToast('Failed to add recurring transaction. Please try again.', 'error');
    }
  };

  // Delete recurring transaction
  const deleteRecurringTransaction = (id) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      const success = saveData({
        ...data,
        recurringTransactions: data.recurringTransactions.filter(r => r.id !== id)
      });

      if (success) {
        showToast('Recurring transaction deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      showToast('Failed to delete recurring transaction. Please try again.', 'error');
    }
  };

  // Toggle recurring transaction active status
  const toggleRecurringActive = (id) => {
    try {
      const updatedRecurring = data.recurringTransactions.map(r =>
        r.id === id ? { ...r, active: !r.active } : r
      );

      const success = saveData({
        ...data,
        recurringTransactions: updatedRecurring
      });

      if (success) {
        const recurring = updatedRecurring.find(r => r.id === id);
        showToast(
          `Recurring transaction ${recurring.active ? 'resumed' : 'paused'}!`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
      showToast('Failed to update recurring transaction. Please try again.', 'error');
    }
  };

  // Add goal
  const addGoal = (goal) => {
    try {
      const newGoal = {
        id: Date.now(),
        ...goal
      };

      const success = saveData({
        ...data,
        goals: [...data.goals, newGoal]
      });

      if (success) {
        showToast('Savings goal created successfully!', 'success');
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      showToast('Failed to add goal. Please try again.', 'error');
    }
  };

  // Update goal progress
  const updateGoalProgress = (id, newCurrent) => {
    try {
      const updatedGoals = data.goals.map(g =>
        g.id === id ? { ...g, current: newCurrent } : g
      );

      const success = saveData({
        ...data,
        goals: updatedGoals
      });

      if (success) {
        showToast('Goal progress updated!', 'success');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      showToast('Failed to update goal. Please try again.', 'error');
    }
  };

  // Delete goal
  const deleteGoal = (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const success = saveData({
        ...data,
        goals: data.goals.filter(g => g.id !== id)
      });

      if (success) {
        showToast('Goal deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      showToast('Failed to delete goal. Please try again.', 'error');
    }
  };

  // Update budgets
  const updateBudgets = (newBudgets) => {
    try {
      const success = saveData({
        ...data,
        budgets: newBudgets
      });

      if (success) {
        showToast('Budgets updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating budgets:', error);
      showToast('Failed to update budgets. Please try again.', 'error');
    }
  };

  // Export data
  const handleExportData = () => {
    try {
      const success = storageService.exportData();
      if (success) {
        showToast('Data exported successfully!', 'success');
      } else {
        showToast('Failed to export data.', 'error');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data. Please try again.', 'error');
    }
  };

  // Import data
  const handleImportData = async (file) => {
    try {
      const importedData = await storageService.importData(file);
      // Ensure all fields exist
      if (!importedData.budgets) importedData.budgets = {};
      if (!importedData.recurringTransactions) importedData.recurringTransactions = [];
      setData(importedData);
      showToast('Data imported successfully!', 'success');
      setView('dashboard');
    } catch (error) {
      console.error('Error importing data:', error);
      showToast('Failed to import data. Please check the file format.', 'error');
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) return;

    try {
      const success = storageService.clearData();
      if (success) {
        setData({
          balance: 0,
          transactions: [],
          goals: [],
          budgets: {},
          recurringTransactions: []
        });
        showToast('All data cleared successfully!', 'warning');
        setView('dashboard');
      } else {
        showToast('Failed to clear data.', 'error');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast('Failed to clear data. Please try again.', 'error');
    }
  };

  // Calculate monthly statistics
  const getMonthlyStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyTransactions = data.transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { monthlyIncome, monthlyExpenses };
  };

  // Get current month spending by category
  const getCurrentMonthSpending = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const categorySpending = {};
    
    data.transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               tDate.getMonth() === thisMonth && 
               tDate.getFullYear() === thisYear;
      })
      .forEach(transaction => {
        const category = transaction.category || 'Other';
        categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
      });

    return categorySpending;
  };

  const { monthlyIncome, monthlyExpenses } = getMonthlyStats();
  const currentMonthSpending = getCurrentMonthSpending();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your finances..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        
        <Header 
          view={view} 
          setView={setView}
          isDarkMode={theme === 'dark'}
          onToggleDarkMode={handleThemeToggle}
        />
        
        <div className="container">
          {view === 'dashboard' && (
            <>
              <div className="kpi-section">
                <KPICards
                  balance={data.balance}
                  monthlyIncome={monthlyIncome}
                  monthlyExpenses={monthlyExpenses}
                  currency={currency}
                />
              </div>
              
              {Object.keys(data.budgets).length > 0 && (
                <BudgetWarnings
                  budgets={data.budgets}
                  currentMonthSpending={currentMonthSpending}
                  currency={currency}
                />
              )}

              <SpendingChart
                transactions={data.transactions}
                currency={currency}
              />

              {data.recurringTransactions.length > 0 && (
                <RecurringTransactionList
                  recurringTransactions={data.recurringTransactions}
                  onDelete={deleteRecurringTransaction}
                  onToggleActive={toggleRecurringActive}
                  currency={currency}
                />
              )}

              <Goals
                goals={data.goals}
                onUpdateGoal={updateGoalProgress}
                onDeleteGoal={deleteGoal}
                currency={currency}
              />
              
              <Transactions
                transactions={data.transactions}
                onDeleteTransaction={deleteTransaction}
                onViewAll={() => setView('transactions')}
                currency={currency}
              />
            </>
          )}

          {view === 'transactions' && (
            <TransactionsPage
              transactions={data.transactions}
              onDeleteTransaction={deleteTransaction}
              currency={currency}
            />
          )}

          {view === 'budget' && (
            <Budget
              transactions={data.transactions}
              budgets={data.budgets}
              onUpdateBudgets={updateBudgets}
              currency={currency}
            />
          )}

          {view === 'reports' && (
            <ReportsPage
              transactions={data.transactions}
              goals={data.goals}
              budgets={data.budgets}
              currentMonthSpending={currentMonthSpending}
              currency={currency}
            />
          )}

          {view === 'add-transaction' && (
            <TransactionForm
              onSubmit={addTransaction}
              onCancel={() => setView('dashboard')}
            />
          )}

          {view === 'add-goal' && (
            <GoalForm
              onSubmit={addGoal}
              onCancel={() => setView('dashboard')}
            />
          )}

          {view === 'add-recurring' && (
            <RecurringTransactionForm
              onSubmit={addRecurringTransaction}
              onCancel={() => setView('dashboard')}
            />
          )}

          {view === 'settings' && (
            <DataManagement
              onExport={handleExportData}
              onImport={handleImportData}
              onClearAll={clearAllData}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
