import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import Goals from './components/Goals';
import Transactions from './components/Transactions';
import TransactionsPage from './components/TransactionsPage';
import TransactionForm from './components/TransactionForm';
import GoalForm from './components/GoalForm';
import Budget from './components/Budget';
import BudgetWarnings from './components/BudgetWarnings';
import DataManagement from './components/DataManagement';
import Notification from './components/Notification';
import { storageService } from './services/storage';

function App() {
  const [data, setData] = useState({
    balance: 0,
    transactions: [],
    goals: [],
    budgets: {}
  });
  const [currency, setCurrency] = useState('USD');
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Load data and settings on mount
  useEffect(() => {
    try {
      const savedData = storageService.getData();
      // Ensure budgets exists
      if (!savedData.budgets) {
        savedData.budgets = {};
      }
      setData(savedData);

      // Load settings
      const savedSettings = storageService.getSettings();
      setCurrency(savedSettings.currency || 'USD');
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load data. Starting fresh.', 'error');
      setLoading(false);
    }
  }, []);

  // Save data whenever it changes
  const saveData = (newData) => {
    try {
      setData(newData);
      const success = storageService.saveData(newData);
      if (!success) {
        showNotification('Failed to save data. Please try again.', 'error');
      }
      return success;
    } catch (error) {
      console.error('Error saving data:', error);
      showNotification('Error saving data. Please try again.', 'error');
      return false;
    }
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    try {
      setCurrency(newCurrency);
      const success = storageService.saveSettings({ currency: newCurrency });
      if (success) {
        showNotification('Currency updated successfully!', 'success');
      } else {
        showNotification('Failed to save currency setting.', 'error');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      showNotification('Failed to update currency. Please try again.', 'error');
    }
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
        showNotification(
          `${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully!`,
          'success'
        );
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showNotification('Failed to add transaction. Please try again.', 'error');
    }
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const transaction = data.transactions.find(t => t.id === id);
      if (!transaction) {
        showNotification('Transaction not found.', 'error');
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
        showNotification('Transaction deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showNotification('Failed to delete transaction. Please try again.', 'error');
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
        showNotification('Savings goal created successfully!', 'success');
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      showNotification('Failed to add goal. Please try again.', 'error');
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
        showNotification('Goal progress updated!', 'success');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      showNotification('Failed to update goal. Please try again.', 'error');
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
        showNotification('Goal deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      showNotification('Failed to delete goal. Please try again.', 'error');
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
        showNotification('Budgets updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating budgets:', error);
      showNotification('Failed to update budgets. Please try again.', 'error');
    }
  };

  // Export data
  const handleExportData = () => {
    try {
      const success = storageService.exportData();
      if (success) {
        showNotification('Data exported successfully!', 'success');
      } else {
        showNotification('Failed to export data.', 'error');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data. Please try again.', 'error');
    }
  };

  // Import data
  const handleImportData = async (file) => {
    try {
      const importedData = await storageService.importData(file);
      // Ensure budgets exists
      if (!importedData.budgets) {
        importedData.budgets = {};
      }
      setData(importedData);
      showNotification('Data imported successfully!', 'success');
      setView('dashboard');
    } catch (error) {
      console.error('Error importing data:', error);
      showNotification('Failed to import data. Please check the file format.', 'error');
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
          budgets: {}
        });
        showNotification('All data cleared successfully!', 'success');
        setView('dashboard');
      } else {
        showNotification('Failed to clear data.', 'error');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      showNotification('Failed to clear data. Please try again.', 'error');
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
        <div className="text-slate-600 text-lg font-light">Loading your finances...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <Header 
        view={view} 
        setView={setView}
      />
      
      <div className="container">
        {view === 'dashboard' && (
          <>
            {/* KPI Cards Section with dedicated spacing */}
            <div className="kpi-section">
              <KPICards
                balance={data.balance}
                monthlyIncome={monthlyIncome}
                monthlyExpenses={monthlyExpenses}
                currency={currency}
              />
            </div>
            
            {/* Budget Warnings */}
            {Object.keys(data.budgets).length > 0 && (
              <BudgetWarnings
                budgets={data.budgets}
                currentMonthSpending={currentMonthSpending}
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
  );
}

export default App;
