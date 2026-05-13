import React, { useState, useEffect, useMemo, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GoalForm from './components/GoalForm';
import Goals from './components/Goals';
import Budget from './components/Budget';
import FinancePlan from './components/FinancePlan';
import FinancialSnapshot from './components/FinancialSnapshot';
import DataManagement from './components/DataManagement';
import RecurringTransactionForm from './components/RecurringTransactionForm';
import RecurringPaymentsPage from './components/RecurringPaymentsPage';
import ReportsPage from './components/ReportsPage';
import AuthPage from './pages/AuthPage';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import { storageService } from './services/storage';
import { supabaseSync } from './services/supabaseSync';
import { processRecurringTransactions } from './utils/recurring';
import { removeDuplicateTransactions, countDuplicates } from './utils/deduplication';
import { getInitialTheme, saveTheme, applyTheme } from './utils/theme';
import { getSnapshotTotals } from './utils/financeSummary';
import { applyLegacySnapshotFields, normaliseSnapshotSections } from './utils/snapshotConfig';

const hasStoredCloudData = (cloudData) => (
  cloudData.transactions.length > 0 ||
  cloudData.goals.length > 0 ||
  Object.keys(cloudData.budgets || {}).length > 0 ||
  cloudData.recurringTransactions.length > 0 ||
  cloudData.planningItems.length > 0 ||
  cloudData.netWorthSnapshots.length > 0
);

function App() {
  const { user, isConfigured } = useAuth();
  const [data, setData] = useState({
    balance: 0,
    transactions: [],
    goals: [],
    budgets: {},
    recurringTransactions: [],
    planningItems: [],
    snapshotSections: normaliseSnapshotSections(),
    netWorthSnapshots: []
  });
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const recurringProcessedRef = useRef(false);

  // Count duplicates
  const duplicateCount = useMemo(() => countDuplicates(data.transactions), [data.transactions]);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Initialize data on mount or when user changes
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      recurringProcessedRef.current = false;
      
      try {
        // If user is logged in and Supabase is configured, use cloud data
        if (user && isConfigured) {
          console.log('🔄 Loading data from Supabase...');
          
          // Initialize sync service
          await supabaseSync.initialize(user.id);
          
          // Try to fetch cloud data
          const cloudData = await supabaseSync.fetchAllData();
          
          if (cloudData) {
            const localData = storageService.getData();

            if (!hasStoredCloudData(cloudData)) {
              // Check if this is first login - migrate local data
              if (
                localData.transactions.length > 0 ||
                localData.goals.length > 0 ||
                localData.recurringTransactions.length > 0
              ) {
                showToast('Migrating your local data to cloud...', 'info');
                const migrated = await supabaseSync.migrateLocalData(localData);
                
                if (migrated) {
                  showToast('✅ Data migrated successfully!', 'success');
                  // Fetch again to get migrated data
                  const freshData = await supabaseSync.fetchAllData();
                  
                  // Auto-dedupe on load
                  const uniqueTransactions = removeDuplicateTransactions(freshData.transactions);
                  if (uniqueTransactions.length < freshData.transactions.length) {
                    console.log('🧹 Auto-cleaned duplicates on load');
                    freshData.transactions = uniqueTransactions;
                  }
                  
                  setData(freshData);
                } else {
                  setData(localData);
                }
              } else {
                setData(cloudData);
              }
            } else {
              // Use cloud data - auto dedupe
              const uniqueTransactions = removeDuplicateTransactions(cloudData.transactions);
              if (uniqueTransactions.length < cloudData.transactions.length) {
                console.log('🧹 Auto-cleaned', cloudData.transactions.length - uniqueTransactions.length, 'duplicates on load');
                cloudData.transactions = uniqueTransactions;
              }
              
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
      if (!savedData.planningItems) savedData.planningItems = [];
      savedData.snapshotSections = normaliseSnapshotSections(savedData.snapshotSections);
      if (!savedData.netWorthSnapshots) savedData.netWorthSnapshots = [];
      
      // Auto-dedupe on load
      const uniqueTransactions = removeDuplicateTransactions(savedData.transactions);
      if (uniqueTransactions.length < savedData.transactions.length) {
        console.log('🧹 Auto-cleaned', savedData.transactions.length - uniqueTransactions.length, 'duplicates on load');
        savedData.transactions = uniqueTransactions;
        storageService.saveData(savedData);
      }
      
      setData(savedData);

      const savedSettings = storageService.getSettings();
      setCurrency(savedSettings.currency || 'USD');
      
      const initialTheme = savedSettings.theme || getInitialTheme();
      setTheme(initialTheme);
      applyTheme(initialTheme);
    };

    initializeData();
  }, [user, isConfigured]);

  // Process recurring transactions - ONLY ONCE per session
  useEffect(() => {
    if (loading || data.recurringTransactions.length === 0 || recurringProcessedRef.current) {
      return;
    }

    const processRecurring = async () => {
      console.log('🔄 Processing recurring transactions...');
      const { newTransactions, updatedRecurring } = processRecurringTransactions(
        data.recurringTransactions.filter(r => r.active),
        data.transactions
      );

      if (newTransactions.length > 0) {
        console.log('💰 Adding', newTransactions.length, 'recurring transactions');
        
        // Calculate new balance
        let newBalance = data.balance;
        newTransactions.forEach(t => {
          newBalance = t.type === 'income' ? newBalance + t.amount : newBalance - t.amount;
        });

        // Save all at once
        await saveData({
          ...data,
          balance: newBalance,
          transactions: [...newTransactions, ...data.transactions],
          recurringTransactions: updatedRecurring
        });

        showToast(
          `${newTransactions.length} recurring transaction${newTransactions.length > 1 ? 's' : ''} processed!`,
          'success'
        );
      } else if (updatedRecurring.length > 0 && JSON.stringify(updatedRecurring) !== JSON.stringify(data.recurringTransactions)) {
        // Update last_processed dates even if no new transactions
        await saveData({
          ...data,
          recurringTransactions: updatedRecurring
        });
      }
      
      recurringProcessedRef.current = true;
    };

    processRecurring();
    
    // Check once per hour
    const interval = setInterval(() => {
      recurringProcessedRef.current = false;
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loading]);

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

  // Remove duplicate transactions
  const handleRemoveDuplicates = async () => {
    if (!confirm(`Remove ${duplicateCount} duplicate transaction${duplicateCount > 1 ? 's' : ''}? This cannot be undone.`)) return;

    try {
      setSyncing(true);
      const uniqueTransactions = removeDuplicateTransactions(data.transactions);
      
      // Recalculate balance from unique transactions
      const recalculatedBalance = uniqueTransactions.reduce((balance, t) => {
        return t.type === 'income' ? balance + t.amount : balance - t.amount;
      }, 0);

      // Update last_processed for all recurring to today to prevent re-adding
      const today = new Date().toISOString().split('T')[0];
      const updatedRecurring = data.recurringTransactions.map(r => ({
        ...r,
        last_processed: today,
        lastProcessed: today
      }));

      const success = await saveData({
        ...data,
        balance: recalculatedBalance,
        transactions: uniqueTransactions,
        recurringTransactions: updatedRecurring
      });

      if (success) {
        showToast(
          `✅ Removed ${duplicateCount} duplicate${duplicateCount > 1 ? 's' : ''} and recalculated balance!`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error removing duplicates:', error);
      showToast('Failed to remove duplicates. Please try again.', 'error');
    } finally {
      setSyncing(false);
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

      // Check for duplicates before adding
      const duplicateKey = `${transactionData.description}-${transactionData.category}-${transactionData.amount}-${transactionData.date}-${transactionData.type}`;
      const isDuplicate = data.transactions.some(t => 
        `${t.description}-${t.category}-${t.amount}-${t.date}-${t.type}` === duplicateKey
      );

      if (isDuplicate) {
        showToast('This transaction already exists!', 'warning');
        setSyncing(false);
        return;
      }

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
      
      const today = new Date().toISOString().split('T')[0];
      const recurringData = {
        ...recurring,
        active: true,
        last_processed: today, // Set to today to prevent immediate processing
        lastProcessed: today
      };

      // Save to Supabase if logged in
      let savedRecurring = null;
      if (user && isConfigured && supabaseSync.isAvailable()) {
        savedRecurring = await supabaseSync.addRecurringTransaction({
          type: recurringData.type,
          amount: recurringData.amount,
          category: recurringData.category,
          description: recurringData.description,
          frequency: recurringData.frequency,
          start_date: recurringData.startDate,
          end_date: recurringData.endDate || null,
          last_processed: recurringData.lastProcessed,
          active: recurringData.active,
        });
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
      setView('recurring');
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

  const addPlanningItem = async (item) => {
    try {
      setSyncing(true);
      let savedItem = null;
      if (user && isConfigured && supabaseSync.isAvailable()) {
        savedItem = await supabaseSync.addPlanningItem(item);
      }

      const newItem = savedItem || {
        id: Date.now(),
        ...item,
        createdAt: new Date().toISOString()
      };

      await saveData({
        ...data,
        planningItems: [newItem, ...data.planningItems]
      });

      showToast('Plan item added successfully!', 'success');
    } catch (error) {
      console.error('Error adding plan item:', error);
      showToast('Failed to add plan item. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const updatePlanningItem = async (id, updates) => {
    try {
      setSyncing(true);
      let savedItem = null;
      if (user && isConfigured && supabaseSync.isAvailable()) {
        savedItem = await supabaseSync.updatePlanningItem(id, updates);
      }

      await saveData({
        ...data,
        planningItems: data.planningItems.map(item => (
          item.id === id
            ? { ...item, ...updates, ...(savedItem || {}), id }
            : item
        ))
      });

      showToast('Plan item updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating plan item:', error);
      showToast('Failed to update plan item. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const deletePlanningItem = async (id) => {
    if (!confirm('Delete this plan item?')) return;

    try {
      setSyncing(true);
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.deletePlanningItem(id);
      }

      await saveData({
        ...data,
        planningItems: data.planningItems.filter(item => item.id !== id)
      });

      showToast('Plan item deleted.', 'success');
    } catch (error) {
      console.error('Error deleting plan item:', error);
      showToast('Failed to delete plan item. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const updateSnapshotSections = async (snapshotSections) => {
    const nextSections = normaliseSnapshotSections(snapshotSections);

    try {
      setSyncing(true);
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.updateSnapshotSections(nextSections);
      }

      await saveData({
        ...data,
        snapshotSections: nextSections
      });

      showToast('Current finances template updated.', 'success');
    } catch (error) {
      console.error('Error updating current finances template:', error);
      showToast('Failed to update template. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const updateRecurringTransaction = async (id, updates) => {
    try {
      setSyncing(true);

      const existing = data.recurringTransactions.find(r => r.id === id);
      if (!existing) {
        showToast('Recurring transaction not found.', 'error');
        return;
      }

      const updatedRecurring = {
        ...existing,
        ...updates,
        id,
        amount: Number(updates.amount || existing.amount),
        nextDate: updates.nextDate || updates.startDate || existing.nextDate,
      };

      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.updateRecurringTransaction(id, {
          type: updatedRecurring.type,
          amount: updatedRecurring.amount,
          category: updatedRecurring.category,
          description: updatedRecurring.description,
          frequency: updatedRecurring.frequency,
          start_date: updatedRecurring.startDate,
          end_date: updatedRecurring.endDate || null,
          last_processed: updatedRecurring.lastProcessed || updatedRecurring.last_processed || null,
          active: updatedRecurring.active,
        });
      }

      await saveData({
        ...data,
        recurringTransactions: data.recurringTransactions.map(r =>
          r.id === id ? updatedRecurring : r
        )
      });

      showToast('Recurring transaction updated successfully!', 'success');
      setView('recurring');
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      showToast('Failed to update recurring transaction. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const addNetWorthSnapshot = async (snapshot) => {
    try {
      setSyncing(true);
      const snapshotToSave = applyLegacySnapshotFields(snapshot, data.snapshotSections);
      let savedSnapshot = null;
      if (user && isConfigured && supabaseSync.isAvailable()) {
        savedSnapshot = await supabaseSync.addNetWorthSnapshot(snapshotToSave);
        if (!savedSnapshot) {
          throw new Error('Cloud snapshot save failed');
        }
      }

      const newSnapshot = savedSnapshot || {
        id: Date.now(),
        ...snapshotToSave,
        createdAt: new Date().toISOString()
      };

      const snapshots = [newSnapshot, ...data.netWorthSnapshots]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const snapshotTotals = getSnapshotTotals(snapshots[0]);

      await saveData({
        ...data,
        balance: snapshotTotals.maxAvailableCash,
        netWorthSnapshots: snapshots
      });

      showToast('Current finances saved and balance updated!', 'success');
    } catch (error) {
      console.error('Error adding net worth snapshot:', error);
      showToast('Failed to save snapshot. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const deleteNetWorthSnapshot = async (id) => {
    if (!confirm('Delete this snapshot?')) return;

    try {
      setSyncing(true);
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await supabaseSync.deleteNetWorthSnapshot(id);
      }

      await saveData({
        ...data,
        netWorthSnapshots: data.netWorthSnapshots.filter(snapshot => snapshot.id !== id)
      });

      showToast('Snapshot deleted.', 'success');
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      showToast('Failed to delete snapshot. Please try again.', 'error');
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
      if (!importedData.planningItems) importedData.planningItems = [];
      importedData.snapshotSections = normaliseSnapshotSections(importedData.snapshotSections);
      if (!importedData.netWorthSnapshots) importedData.netWorthSnapshots = [];
      
      // Dedupe imported data
      importedData.transactions = removeDuplicateTransactions(importedData.transactions);
      
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
          recurringTransactions: [],
          planningItems: [],
          snapshotSections: normaliseSnapshotSections(),
          netWorthSnapshots: []
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

  // Calculate last 30 days statistics
  const getLast30DaysStats = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    const last30DaysTransactions = data.transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= thirtyDaysAgo && tDate <= now;
    });

    const last30DaysIncome = last30DaysTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const last30DaysExpenses = last30DaysTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { last30DaysIncome, last30DaysExpenses };
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
  const { last30DaysIncome, last30DaysExpenses } = getLast30DaysStats();
  const currentMonthSpending = getCurrentMonthSpending();

  const pageMeta = {
    budget: {
      title: 'Budgets',
      description: 'Compare spending against limits and tune your categories before they drift.',
    },
    plan: {
      title: 'Plan',
      description: 'Track dated commitments and asset sales without mixing them into savings goals.',
    },
    goals: {
      title: 'Goals',
      description: 'Track savings targets such as house deposit, emergency fund, car plans, and long-term milestones.',
    },
    snapshot: {
      title: 'Current Finances',
      description: 'Capture a flexible snapshot of banks, cards, savings, investments, pensions, and commitments.',
    },
    reports: {
      title: 'Reports',
      description: 'Turn historical spending into trends, exports, and decision-ready summaries.',
    },
    settings: {
      title: 'Settings',
      description: 'Manage currency, backups, imports, and local data controls.',
    },
    'add-goal': {
      title: 'Add Savings Goal',
      description: 'Set a target, add a deadline, and track the next milestone.',
    },
    'add-recurring': {
      title: 'Add Recurring Item',
      description: 'Set up predictable bills, subscriptions, salary, or transfers.',
    },
    'add-recurring-income': {
      title: 'Add Recurring Income',
      description: 'Add salary or other reliable income so monthly savings capacity can be calculated.',
    },
  };

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
      <div className="app-shell">
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
        
        <main className="app-main">
          {pageMeta[view] && (
            <section className="page-heading">
              <div>
                <h1>{pageMeta[view].title}</h1>
                <p>{pageMeta[view].description}</p>
              </div>
            </section>
          )}

          {view === 'dashboard' && (
            <Dashboard
              data={data}
              currency={currency}
              onNavigate={setView}
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

          {view === 'plan' && (
            <FinancePlan
              planningItems={data.planningItems}
              onAddPlanningItem={addPlanningItem}
              onUpdatePlanningItem={updatePlanningItem}
              onDeletePlanningItem={deletePlanningItem}
              currency={currency}
            />
          )}

          {view === 'recurring' && (
            <RecurringPaymentsPage
              recurringTransactions={data.recurringTransactions}
              onAddRecurring={addRecurringTransaction}
              onUpdateRecurring={updateRecurringTransaction}
              onDeleteRecurring={deleteRecurringTransaction}
              onToggleRecurring={toggleRecurringActive}
              currency={currency}
            />
          )}

          {view === 'goals' && (
            <Goals
              goals={data.goals}
              onAddGoal={() => setView('add-goal')}
              onUpdateGoal={updateGoalProgress}
              onDeleteGoal={deleteGoal}
              currency={currency}
            />
          )}

          {view === 'snapshot' && (
            <FinancialSnapshot
              netWorthSnapshots={data.netWorthSnapshots}
              snapshotSections={data.snapshotSections}
              onUpdateSnapshotSections={updateSnapshotSections}
              onAddNetWorthSnapshot={addNetWorthSnapshot}
              onDeleteNetWorthSnapshot={deleteNetWorthSnapshot}
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

          {view === 'add-goal' && (
            <GoalForm
              onSubmit={addGoal}
              onCancel={() => setView('dashboard')}
            />
          )}

          {(view === 'add-recurring' || view === 'add-recurring-income') && (
            <RecurringTransactionForm
              onSubmit={addRecurringTransaction}
              onCancel={() => setView('dashboard')}
              initialType={view === 'add-recurring-income' ? 'income' : 'expense'}
            />
          )}

          {view === 'settings' && (
            <DataManagement
              onExport={handleExportData}
              onImport={handleImportData}
              onClearAll={clearAllData}
              onRemoveDuplicates={handleRemoveDuplicates}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              duplicateCount={duplicateCount}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
