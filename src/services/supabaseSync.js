import { supabase, isSupabaseConfigured } from '../lib/supabase';

const normalizeRecurringTransaction = (item) => ({
  ...item,
  active: item.active ?? item.is_active ?? true,
  startDate: item.startDate || item.start_date,
  endDate: item.endDate || item.end_date,
  lastProcessed: item.lastProcessed || item.last_processed || item.last_generated_date,
});

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
      return (data || []).map(normalizeRecurringTransaction);
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
      return normalizeRecurringTransaction(data);
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
  // FINANCE PLANNING
  // ==============================================

  transformPlanningItemFromSupabase(item) {
    return {
      id: item.id,
      title: item.title,
      type: item.item_type,
      targetAmount: Number(item.target_amount || 0),
      savedAmount: Number(item.saved_amount || 0),
      expectedValue: Number(item.expected_value || 0),
      dueDate: item.due_date,
      priority: item.priority,
      status: item.status,
      notes: item.notes || '',
      createdAt: item.created_at,
    };
  }

  transformPlanningItemToSupabase(item) {
    return {
      title: item.title,
      item_type: item.type || 'expense',
      target_amount: Number(item.targetAmount || 0),
      saved_amount: Number(item.savedAmount || 0),
      expected_value: Number(item.expectedValue || 0),
      due_date: item.dueDate || null,
      priority: item.priority || 'medium',
      status: item.status || 'planned',
      notes: item.notes || '',
    };
  }

  async getPlanningItems() {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await supabase
        .from('planning_items')
        .select('*')
        .eq('user_id', this.userId)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return (data || []).map(item => this.transformPlanningItemFromSupabase(item));
    } catch (error) {
      console.error('Error fetching planning items:', error);
      return [];
    }
  }

  async addPlanningItem(item) {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await supabase
        .from('planning_items')
        .insert({
          user_id: this.userId,
          ...this.transformPlanningItemToSupabase(item),
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformPlanningItemFromSupabase(data);
    } catch (error) {
      console.error('Error adding planning item:', error);
      return null;
    }
  }

  async deletePlanningItem(itemId) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('planning_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting planning item:', error);
      return false;
    }
  }

  // ==============================================
  // NET WORTH SNAPSHOTS
  // ==============================================

  transformSnapshotFromSupabase(snapshot) {
    return {
      id: snapshot.id,
      date: snapshot.snapshot_date,
      santander: Number(snapshot.santander || 0),
      tesco: Number(snapshot.tesco || 0),
      amexCashback: Number(snapshot.amex_cashback || 0),
      moneybox: Number(snapshot.moneybox || 0),
      moneyboxStocksSharesIsa: Number(snapshot.moneybox_stocks_shares_isa || 0),
      moneyboxLifetimeIsa: Number(snapshot.moneybox_lifetime_isa || 0),
      moneyboxSimpleSaver: Number(snapshot.moneybox_simple_saver || 0),
      moneyboxCashIsa: Number(snapshot.moneybox_cash_isa || 0),
      moneyboxMonthly: Number(snapshot.moneybox_monthly || 0),
      notes: snapshot.notes || '',
      paycheck: Number(snapshot.paycheck || 0),
      pension: Number(snapshot.pension || 0),
      createdAt: snapshot.created_at,
    };
  }

  transformSnapshotToSupabase(snapshot) {
    return {
      snapshot_date: snapshot.date,
      santander: Number(snapshot.santander || 0),
      tesco: Number(snapshot.tesco || 0),
      amex_cashback: Number(snapshot.amexCashback || 0),
      moneybox: Number(snapshot.moneybox || 0),
      moneybox_stocks_shares_isa: Number(snapshot.moneyboxStocksSharesIsa || 0),
      moneybox_lifetime_isa: Number(snapshot.moneyboxLifetimeIsa || 0),
      moneybox_simple_saver: Number(snapshot.moneyboxSimpleSaver || 0),
      moneybox_cash_isa: Number(snapshot.moneyboxCashIsa || 0),
      moneybox_monthly: Number(snapshot.moneyboxMonthly || 0),
      notes: snapshot.notes || '',
      paycheck: Number(snapshot.paycheck || 0),
      pension: Number(snapshot.pension || 0),
    };
  }

  async getNetWorthSnapshots() {
    if (!this.isAvailable()) return [];

    try {
      const { data, error } = await supabase
        .from('net_worth_snapshots')
        .select('*')
        .eq('user_id', this.userId)
        .order('snapshot_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(snapshot => this.transformSnapshotFromSupabase(snapshot));
    } catch (error) {
      console.error('Error fetching net worth snapshots:', error);
      return [];
    }
  }

  async addNetWorthSnapshot(snapshot) {
    if (!this.isAvailable()) return null;

    try {
      const { data, error } = await supabase
        .from('net_worth_snapshots')
        .insert({
          user_id: this.userId,
          ...this.transformSnapshotToSupabase(snapshot),
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformSnapshotFromSupabase(data);
    } catch (error) {
      console.error('Error adding net worth snapshot:', error);
      return null;
    }
  }

  async deleteNetWorthSnapshot(snapshotId) {
    if (!this.isAvailable()) return false;

    try {
      const { error } = await supabase
        .from('net_worth_snapshots')
        .delete()
        .eq('id', snapshotId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting net worth snapshot:', error);
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

      if (localData.planningItems?.length > 0) {
        console.log(`Migrating ${localData.planningItems.length} planning items...`);
        for (const item of localData.planningItems) {
          await this.addPlanningItem(item);
        }
      }

      if (localData.netWorthSnapshots?.length > 0) {
        console.log(`Migrating ${localData.netWorthSnapshots.length} net worth snapshots...`);
        for (const snapshot of localData.netWorthSnapshots) {
          await this.addNetWorthSnapshot(snapshot);
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
      const [
        settings,
        transactions,
        goals,
        budgets,
        recurringTransactions,
        planningItems,
        netWorthSnapshots,
      ] = await Promise.all([
        this.getUserSettings(),
        this.getTransactions(),
        this.getGoals(),
        this.getBudgets(),
        this.getRecurringTransactions(),
        this.getPlanningItems(),
        this.getNetWorthSnapshots(),
      ]);

      return {
        balance: settings?.balance || 0,
        transactions: transactions || [],
        goals: goals || [], // Goals are already transformed by getGoals()
        budgets: budgets || {},
        recurringTransactions: recurringTransactions || [],
        planningItems: planningItems || [],
        netWorthSnapshots: netWorthSnapshots || [],
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      return null;
    }
  }
}

// Export singleton instance
export const supabaseSync = new SupabaseSyncService();
