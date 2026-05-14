import React, { useState, useEffect, useRef } from 'react';
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
import ConfirmDialog from './components/ConfirmDialog';
import { useAuth } from './contexts/AuthContext';
import { storageService } from './services/storage';
import { supabaseSync } from './services/supabaseSync';
import { removeDuplicateTransactions } from './utils/deduplication';
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
  const [confirmation, setConfirmation] = useState(null);
  const confirmationResolverRef = useRef(null);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const requestConfirmation = (options) => new Promise((resolve) => {
    confirmationResolverRef.current = resolve;
    setConfirmation(options);
  });

  const resolveConfirmation = (confirmed) => {
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(confirmed);
    }
    confirmationResolverRef.current = null;
    setConfirmation(null);
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
      return true;
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      showToast('Failed to add recurring transaction. Please try again.', 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Delete recurring transaction
  const deleteRecurringTransaction = async (id) => {
    const confirmed = await requestConfirmation({
      title: 'Delete recurring item?',
      message: 'This recurring payment will stop appearing in your monthly plan.',
      confirmLabel: 'Delete recurring item',
    });
    if (!confirmed) return;

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
    const confirmed = await requestConfirmation({
      title: 'Delete savings goal?',
      message: 'This goal and its progress will be removed from your plan.',
      confirmLabel: 'Delete goal',
    });
    if (!confirmed) return;

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
    const confirmed = await requestConfirmation({
      title: 'Delete plan item?',
      message: 'This planned cost, sale, or target will be removed from your forecast.',
      confirmLabel: 'Delete plan item',
    });
    if (!confirmed) return;

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
        const synced = await supabaseSync.updateSnapshotSections(nextSections);
        if (!synced) {
          throw new Error('Cloud template save failed');
        }
      }

      const saved = await saveData({
        ...data,
        snapshotSections: nextSections
      });
      if (!saved) {
        throw new Error('Local template save failed');
      }

      showToast('Current finances template updated.', 'success');
      return true;
    } catch (error) {
      console.error('Error updating current finances template:', error);
      showToast('Failed to update template. Please try again.', 'error');
      return false;
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
        return false;
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
      return true;
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      showToast('Failed to update recurring transaction. Please try again.', 'error');
      return false;
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

  const importNetWorthSnapshots = async (snapshots) => {
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      showToast('No snapshots to import.', 'warning');
      return false;
    }

    const importedCloudSnapshotIds = [];

    try {
      setSyncing(true);
      const savedSnapshots = [];
      const importDates = new Set(snapshots.map((snapshot) => snapshot.date));
      const shouldSyncCloud = user && isConfigured && supabaseSync.isAvailable();
      const existingToReplace = shouldSyncCloud
        ? data.netWorthSnapshots.filter((snapshot) => importDates.has(snapshot.date))
        : [];

      for (const snapshot of snapshots) {
        const snapshotToSave = applyLegacySnapshotFields(snapshot, data.snapshotSections);
        let savedSnapshot = null;

        if (shouldSyncCloud) {
          savedSnapshot = await supabaseSync.addNetWorthSnapshot(snapshotToSave);
          if (!savedSnapshot) {
            throw new Error(`Cloud snapshot import failed for ${snapshot.date}`);
          }
          importedCloudSnapshotIds.push(savedSnapshot.id);
        }

        savedSnapshots.push(savedSnapshot || {
          id: snapshot.id || `${Date.now()}-${snapshot.date}`,
          ...snapshotToSave,
          createdAt: snapshot.createdAt || new Date().toISOString()
        });
      }

      for (const existingSnapshot of existingToReplace) {
        const deleted = await supabaseSync.deleteNetWorthSnapshot(existingSnapshot.id);
        if (!deleted) {
          throw new Error(`Cloud snapshot replacement cleanup failed for ${existingSnapshot.date}`);
        }
      }

      const importedDates = new Set(savedSnapshots.map((snapshot) => snapshot.date));
      const mergedSnapshots = [
        ...savedSnapshots,
        ...data.netWorthSnapshots.filter((snapshot) => !importedDates.has(snapshot.date))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      const snapshotTotals = getSnapshotTotals(mergedSnapshots[0]);

      await saveData({
        ...data,
        balance: snapshotTotals.maxAvailableCash,
        netWorthSnapshots: mergedSnapshots
      });

      showToast(`${savedSnapshots.length} current finance snapshot${savedSnapshots.length === 1 ? '' : 's'} imported.`, 'success');
      return true;
    } catch (error) {
      console.error('Error importing net worth snapshots:', error);
      if (user && isConfigured && supabaseSync.isAvailable()) {
        await Promise.allSettled(
          importedCloudSnapshotIds.map((snapshotId) => supabaseSync.deleteNetWorthSnapshot(snapshotId))
        );
      }
      showToast('Failed to import snapshots. Please check the CSV file.', 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const deleteNetWorthSnapshot = async (id) => {
    const confirmed = await requestConfirmation({
      title: 'Delete current finances snapshot?',
      message: 'This dated snapshot will be removed from history and trend reporting.',
      confirmLabel: 'Delete snapshot',
    });
    if (!confirmed) return;

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
  const clearAllData = async () => {
    const confirmed = await requestConfirmation({
      title: 'Clear all local data?',
      message: 'This permanently removes goals, budgets, plans, recurring items, snapshots, and local backup data.',
      confirmLabel: 'Clear all data',
    });
    if (!confirmed) return;

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

  const pageMeta = {
    budget: {
      title: 'Monthly Budget',
      description: 'Plan around dependable income, known outgoings, and the capacity left each month.',
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
      description: 'Review monthly income, outgoings, savings context, planning exposure, and net worth trends.',
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

        {confirmation && (
          <ConfirmDialog
            {...confirmation}
            onConfirm={() => resolveConfirmation(true)}
            onCancel={() => resolveConfirmation(false)}
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

        {confirmation && (
          <ConfirmDialog
            {...confirmation}
            onConfirm={() => resolveConfirmation(true)}
            onCancel={() => resolveConfirmation(false)}
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
              recurringTransactions={data.recurringTransactions}
              latestSnapshot={data.netWorthSnapshots[0]}
              budgets={data.budgets}
              currency={currency}
              onNavigate={setView}
              onUpdateBudgets={updateBudgets}
            />
          )}

          {view === 'plan' && (
            <FinancePlan
              planningItems={data.planningItems}
              latestSnapshot={data.netWorthSnapshots[0]}
              recurringTransactions={data.recurringTransactions}
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
              onImportNetWorthSnapshots={importNetWorthSnapshots}
              onDeleteNetWorthSnapshot={deleteNetWorthSnapshot}
              currency={currency}
            />
          )}

          {view === 'reports' && (
            <ReportsPage
              goals={data.goals}
              recurringTransactions={data.recurringTransactions}
              planningItems={data.planningItems}
              netWorthSnapshots={data.netWorthSnapshots}
              latestSnapshot={data.netWorthSnapshots[0]}
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
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
