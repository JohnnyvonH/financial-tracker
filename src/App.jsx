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
import AuthPage from './pages/AuthPage';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import { storageService } from './services/storage';
import { supabaseSync } from './services/supabaseSync';
import { processRecurringTransactions } from './utils/recurring';
import { getInitialTheme, saveTheme, applyTheme } from './utils/theme';

function App() {
  const { user, isConfigured } = useAuth();
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
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Initialize data on mount or when user changes
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      try {
        // If user is logged in and Supabase is configured, use cloud data
        if (user && isConfigured) {
          console.log('🔄 Loading data from Supabase...');
          
          // Initialize sync service
          await supabaseSync.initialize(user.id);
          
          // Try to fetch cloud data
          const cloudData = await supabaseSync.fetchAllData();
          
          if (cloudData) {
            // Check if this is first login - migrate local data
            if (cloudData.transactions.length === 0) {
              const localData = storageService.getData();
              
              if (localData.transactions.length > 0 || localData.goals.length > 0) {
                showToast('Migrating your local data to cloud...', 'info');
                const migrated = await supabaseSync.migrateLocalData(localData);
                
                if (migrated) {
                  showToast('✅ Data migrated successfully!', 'success');
                  // Fetch again to get migrated data
                  const freshData = await supabaseSync.fetchAllData();
                  setData(freshData);
                } else {
                  setData(localData);
                }
              } else {
                setData(cloudData);
              }
            } else {
              // Use cloud data
              setData(cloudData);
              showToast('Data loaded from cloud ☁️', 'success');
            }
            
            // Load user settings
            const settings = await supabaseSync.getUserSettings();
            if (settings) {
              setCurrency(settings.currency || 'USD');
              const userTheme = settings.theme || getInitialTheme();
              setTheme(userTheme);
              applyTheme(userTheme);
            }
          } else {
            // Fallback to local storage
            console.warn('⚠️ Could not load from Supabase, using local storage');
            loadLocalData();
          }
        } else {
          // Not logged in or not configured - use local storage
          loadLocalData();
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('Failed to load data. Using local storage.', 'error');
        loadLocalData();
      } finally {
        setLoading(false);
      }
    };

    const loadLocalData = () => {
      const savedData = storageService.getData();
      if (!savedData.budgets) savedData.budgets = {};
      if (!savedData.recurringTransactions) savedData.recurringTransactions = [];
      setData(savedData);

      const savedSettings = storageService.getSettings();
      setCurrency(savedSettings.currency || 'USD');
      
      const initialTheme = savedSettings.theme || getInitialTheme();
      setTheme(initialTheme);
      applyTheme(initialTheme);
    };

    initializeData();
  }, [user, isConfigured]);

  // Process recurring transactions daily
  useEffect(() => {
    if (loading || data.recurringTransactions.length === 0) return;

    const processRecurring = async () => {
      const { newTransactions, updatedRecurring } = processRecurringTransactions(
        data.recurringTransactions.filter(r => r.active)
      );

      if (newTransactions.length > 0) {
        // Add new transactions
        for (const transaction of newTransactions) {
          await addTransaction(transaction, false); // Don't show toast for each
        }

        showToast(
          `${newTransactions.length} recurring transaction${newTransactions.length > 1 ? 's' : ''} processed!`,
          'success'
        );
      }
    };

    processRecurring();
    const interval = setInterval(processRecurring, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loading, data.recurringTransactions]);

  // Save data (to both local storage and Supabase if logged in)
  const saveData = async (newData) => {
    try {
      setData(newData);
      
      // Always save to local storage as backup
      storageService.saveData(newData);
      
      // If logged in, also save to Supabase
      if (user && isConfigured && supabaseSync.isAvailable()) {
        // Note: Individual operations handle their own Supabase sync
        // This is just for updating balance in settings
        await supabaseSync.updateUserSettings({ balance: newData.balance });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('Error saving data. Please try again.', 'error');
      return false;
    }
  };

  // Handle currency change
  const handleCurrencyChange = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      
      // Save to local storage
      const settings = storageService.getSettings();
      storageService.saveSettings({ ...settings, currency: newCurrency });
      
      // Save to Supabase if logged in
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.updateUserSettings({ currency: newCurrency });
      }
      
      showToast('Currency updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating currency:', error);
      showToast('Failed to update currency. Please try again.', 'error');
    }
  };

  // Handle theme toggle
  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    saveTheme(newTheme);
    
    // Save to local storage
    const settings = storageService.getSettings();
    storageService.saveSettings({ ...settings, theme: newTheme });
    
    // Save to Supabase if logged in
    if (user && isConfigured && supabaseSync.isAvailable()) {
      await supabaseSync.updateUserSettings({ theme: newTheme });
    }
    
    showToast(`Switched to ${newTheme} mode`, 'info');
  };

  // Add transaction
  const addTransaction = async (transaction, showToastMsg = true) => {
    try {
      setSyncing(true);
      
      const transactionData = {
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || '',
        date: transaction.date,
        timestamp: Date.now()
      };

      // If logged in, save to Supabase first
      let savedTransaction = null;
      if (user && isConfigured && supabaseSync.isAvailable()) {
        savedTransaction = await supabaseSync.addTransaction(transactionData);
      }

      // Use Supabase ID if available, otherwise generate local ID
      const newTransaction = savedTransaction || {
        id: Date.now(),
        ...transactionData
      };

      const newBalance = transaction.type === 'income'
        ? data.balance + transaction.amount
        : data.balance - transaction.amount;

      await saveData({
        ...data,
        balance: newBalance,
        transactions: [newTransaction, ...data.transactions]
      });

      if (showToastMsg) {
        showToast(
          `${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully!`,
          'success'
        );
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showToast('Failed to add transaction. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      setSyncing(true);
      
      const transaction = data.transactions.find(t => t.id === id);
      if (!transaction) {
        showToast('Transaction not found.', 'error');
        return;
      }

      // Delete from Supabase if logged in
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.deleteTransaction(id);
      }

      const newBalance = transaction.type === 'income'
        ? data.balance - transaction.amount
        : data.balance + transaction.amount;

      await saveData({
        ...data,
        balance: newBalance,
        transactions: data.transactions.filter(t => t.id !== id)
      });

      showToast('Transaction deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showToast('Failed to delete transaction. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Add recurring transaction
  const addRecurringTransaction = async (recurring) => {
    try {
      setSyncing(true);
      
      const recurringData = {
        ...recurring,
        active: true,
        last_processed: null
      };

      // Save to Supabase if logged in
      let savedRecurring = null;
      if (user && isConfigured && supabaseSync.isAvailable()) {
        savedRecurring = await supabaseSync.addRecurringTransaction(recurringData);
      }

      const newRecurring = savedRecurring || {
        id: Date.now(),
        ...recurringData,
        createdAt: Date.now()
      };

      await saveData({
        ...data,
        recurringTransactions: [...data.recurringTransactions, newRecurring]
      });

      showToast('Recurring transaction created successfully!', 'success');
      setView('dashboard');
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      showToast('Failed to add recurring transaction. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Delete recurring transaction
  const deleteRecurringTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      setSyncing(true);
      
      // Delete from Supabase if logged in
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.deleteRecurringTransaction(id);
      }

      await saveData({
        ...data,
        recurringTransactions: data.recurringTransactions.filter(r => r.id !== id)
      });

      showToast('Recurring transaction deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      showToast('Failed to delete recurring transaction. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Toggle recurring transaction active status
  const toggleRecurringActive = async (id) => {
    try {
      setSyncing(true);
      
      const recurring = data.recurringTransactions.find(r => r.id === id);
      const newActive = !recurring.active;
      
      // Update in Supabase if logged in
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.updateRecurringTransaction(id, { active: newActive });
      }

      const updatedRecurring = data.recurringTransactions.map(r =>
        r.id === id ? { ...r, active: newActive } : r
      );

      await saveData({
        ...data,
        recurringTransactions: updatedRecurring
      });

      showToast(
        `Recurring transaction ${newActive ? 'resumed' : 'paused'}!`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
      showToast('Failed to update recurring transaction. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Add goal
  const addGoal = async (goal) => {
    try {
      setSyncing(true);
      
      const goalData = {
        name: goal.name,
        target_amount: goal.target,
        current_amount: goal.current || 0,
        deadline: goal.deadline || null
      };

      // Save to Supabase if logged in
      let savedGoal = null;
      if (user && isConfigured && supabaseSync.isAvailable()) {
        savedGoal = await supabaseSync.addGoal(goalData);
      }

      const newGoal = savedGoal ? {
        id: savedGoal.id,
        name: savedGoal.name,
        target: savedGoal.target_amount,
        current: savedGoal.current_amount,
        deadline: savedGoal.deadline
      } : {
        id: Date.now(),
        ...goal
      };

      await saveData({
        ...data,
        goals: [...data.goals, newGoal]
      });

      showToast('Savings goal created successfully!', 'success');
      setView('dashboard');
    } catch (error) {
      console.error('Error adding goal:', error);
      showToast('Failed to add goal. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Update goal progress
  const updateGoalProgress = async (id, newCurrent) => {
    try {
      setSyncing(true);
      
      // Update in Supabase if logged in
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.updateGoal(id, { current_amount: newCurrent });
      }

      const updatedGoals = data.goals.map(g =>
        g.id === id ? { ...g, current: newCurrent } : g
      );

      await saveData({
        ...data,
        goals: updatedGoals
      });

      showToast('Goal progress updated!', 'success');
    } catch (error) {
      console.error('Error updating goal:', error);
      showToast('Failed to update goal. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Delete goal
  const deleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      setSyncing(true);
      
      // Delete from Supabase if logged in
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.deleteGoal(id);
      }

      await saveData({
        ...data,
        goals: data.goals.filter(g => g.id !== id)
      });

      showToast('Goal deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting goal:', error);
      showToast('Failed to delete goal. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Update budgets
  const updateBudgets = async (newBudgets) => {
    try {
      setSyncing(true);
      
      // Update in Supabase if logged in
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.updateBudgets(newBudgets);
      }

      await saveData({
        ...data,
        budgets: newBudgets
      });

      showToast('Budgets updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating budgets:', error);
      showToast('Failed to update budgets. Please try again.', 'error');
    } finally {
      setSyncing(false);
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

  // Show auth page if configured and requesting sign in
  if (isConfigured && view === 'auth') {
    return (
      <ErrorBoundary>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <AuthPage onBack={() => setView('dashboard')} />
      </ErrorBoundary>
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
        
        {syncing && (
          <div className="fixed top-20 right-4 z-50">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Syncing...</span>
            </div>
          </div>
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
