import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Supabase Sync Service
 * Handles all database operations and syncing with Supabase
 */

class SupabaseSyncService {
  constructor() {
    this.isConfigured = isSupabaseConfigured();
    this.userId = null;
  }

  /**
   * Initialize the sync service with user ID
   */
  async initialize(userId) {
    if (!this.isConfigured || !userId) return false;
    this.userId = userId;
    console.log('✅ Supabase sync initialized for user:', userId);
    return true;
  }

  /**
   * Check if sync is available
   */
  isAvailable() {
    return this.isConfigured && this.userId;
  }

  // ==============================================
  // USER SETTINGS
  // ==============================================

  /**
   * Get user settings (balance, currency, theme)
   */
  async getUserSettings() {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error) {
        // If no settings exist, create default ones
        if (error.code === 'PGRST116') {
          return await this.createUserSettings();
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  /**
   * Create default user settings
   */
  async createUserSettings() {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: this.userId,
          currency: 'USD',
          theme: 'dark',
          balance: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user settings:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(updates) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }

  // ==============================================
  // TRANSACTIONS
  // ==============================================

  /**
   * Get all transactions for user
   */
  async getTransactions() {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Add a new transaction
   */
  async addTransaction(transaction) {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: this.userId,
          ...transaction,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update balance
      await this.updateBalance();
      
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(transactionId) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', this.userId);

      if (error) throw error;
      
      // Update balance
      await this.updateBalance();
      
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  /**
   * Calculate and update balance from transactions
   */
  async updateBalance() {
    if (!this.isAvailable()) return;

    try {
      const transactions = await this.getTransactions();
      
      const balance = transactions.reduce((sum, t) => {
        return t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount);
      }, 0);

      await this.updateUserSettings({ balance });
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }

  // ==============================================
  // GOALS
  // ==============================================

  /**
   * Transform Supabase goal to app format
   */
  transformGoalFromSupabase(supabaseGoal) {
    return {
      id: supabaseGoal.id,
      name: supabaseGoal.name,
      target: Number(supabaseGoal.target_amount || 0),
      current: Number(supabaseGoal.current_amount || 0),
      deadline: supabaseGoal.deadline,
    };
  }

  /**
   * Get all goals for user
   */
  async getGoals() {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform goals to app format
      return (data || []).map(goal => this.transformGoalFromSupabase(goal));
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  /**
   * Add a new goal
   */
  async addGoal(goal) {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: this.userId,
          ...goal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding goal:', error);
      return null;
    }
  }

  /**
   * Update goal progress
   */
  async updateGoal(goalId, updates) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  // ==============================================
  // BUDGETS
  // ==============================================

  /**
   * Get all budgets for user
   */
  async getBudgets() {
    if (!this.isAvailable()) return {};

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', this.userId);

      if (error) throw error;
      
      // Convert array to object { category: limit }
      const budgetsObj = {};
      data?.forEach(budget => {
        budgetsObj[budget.category] = Number(budget.monthly_limit);
      });
      
      return budgetsObj;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return {};
    }
  }

  /**
   * Update budgets (replace all)
   */
  async updateBudgets(budgets) {
    if (!this.isAvailable()) return false;

    try {
      // Delete existing budgets
      await supabase
        .from('budgets')
        .delete()
        .eq('user_id', this.userId);

      // Insert new budgets
      const budgetArray = Object.entries(budgets).map(([category, monthly_limit]) => ({
        user_id: this.userId,
        category,
        monthly_limit,
      }));

      if (budgetArray.length > 0) {
        const { error } = await supabase
          .from('budgets')
          .insert(budgetArray);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating budgets:', error);
      return false;
    }
  }

  // ==============================================
  // RECURRING TRANSACTIONS
  // ==============================================

  /**
   * Get all recurring transactions for user
   */
  async getRecurringTransactions() {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      return [];
    }
  }

  /**
   * Add a recurring transaction
   */
  async addRecurringTransaction(recurring) {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: this.userId,
          ...recurring,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      return null;
    }
  }

  /**
   * Update recurring transaction
   */
  async updateRecurringTransaction(recurringId, updates) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', recurringId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      return false;
    }
  }

  /**
   * Delete a recurring transaction
   */
  async deleteRecurringTransaction(recurringId) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', recurringId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      return false;
    }
  }

  // ==============================================
  // DATA MIGRATION
  // ==============================================

  /**
   * Migrate localStorage data to Supabase
   */
  async migrateLocalData(localData) {
    if (!this.isAvailable()) return false;

    console.log('📤 Starting data migration to Supabase...');

    try {
      // Check if user already has data in Supabase
      const existingTransactions = await this.getTransactions();
      
      if (existingTransactions.length > 0) {
        console.log('ℹ️ User already has data in Supabase. Skipping migration.');
        return true;
      }

      // Migrate transactions
      if (localData.transactions?.length > 0) {
        console.log(`📤 Migrating ${localData.transactions.length} transactions...`);
        for (const transaction of localData.transactions) {
          await this.addTransaction(transaction);
        }
      }

      // Migrate goals
      if (localData.goals?.length > 0) {
        console.log(`📤 Migrating ${localData.goals.length} goals...`);
        for (const goal of localData.goals) {
          // Transform local goal format to Supabase format
          const supabaseGoal = {
            name: goal.name,
            target_amount: goal.target,
            current_amount: goal.current || 0,
            deadline: goal.deadline || null,
          };
          await this.addGoal(supabaseGoal);
        }
      }

      // Migrate budgets
      if (localData.budgets && Object.keys(localData.budgets).length > 0) {
        console.log(`📤 Migrating budgets...`);
        await this.updateBudgets(localData.budgets);
      }

      // Migrate recurring transactions
      if (localData.recurringTransactions?.length > 0) {
        console.log(`📤 Migrating ${localData.recurringTransactions.length} recurring transactions...`);
        for (const recurring of localData.recurringTransactions) {
          await this.addRecurringTransaction(recurring);
        }
      }

      // Update settings
      await this.updateUserSettings({
        balance: localData.balance || 0,
        currency: localStorage.getItem('currency') || 'USD',
        theme: localStorage.getItem('theme') || 'dark',
      });

      console.log('✅ Data migration completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error migrating data:', error);
      return false;
    }
  }

  /**
   * Fetch all user data from Supabase
   */
  async fetchAllData() {
    if (!this.isAvailable()) return null;

    try {
      const [settings, transactions, goals, budgets, recurringTransactions] = await Promise.all([
        this.getUserSettings(),
        this.getTransactions(),
        this.getGoals(),
        this.getBudgets(),
        this.getRecurringTransactions(),
      ]);

      return {
        balance: settings?.balance || 0,
        transactions: transactions || [],
        goals: goals || [], // Goals are already transformed by getGoals()
        budgets: budgets || {},
        recurringTransactions: recurringTransactions || [],
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      return null;
    }
  }
}

// Export singleton instance
export const supabaseSync = new SupabaseSyncService();
