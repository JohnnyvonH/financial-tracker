import { supabase } from '../lib/supabase';

/**
 * Database service layer for Supabase operations
 * Provides CRUD operations for all tables
 */

// ================================================
// TRANSACTIONS
// ================================================

export const transactionsService = {
  // Get all transactions for user
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get transactions for date range
  getByDateRange: async (userId, startDate, endDate) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get transactions by category
  getByCategory: async (userId, category) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create transaction
  create: async (userId, transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update transaction
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete transaction
  delete: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribe: (userId, callback) => {
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// ================================================
// BUDGETS
// ================================================

export const budgetsService = {
  // Get all budgets
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  // Get budget status (with spending calculation)
  getStatus: async (userId, startDate, endDate) => {
    const { data, error } = await supabase
      .rpc('get_budget_status', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      });
    
    if (error) throw error;
    return data;
  },

  // Create budget
  create: async (userId, budget) => {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{ ...budget, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update budget
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete budget
  delete: async (id) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to changes
  subscribe: (userId, callback) => {
    const channel = supabase
      .channel('budgets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// ================================================
// GOALS
// ================================================

export const goalsService = {
  // Get all goals
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get active goals only
  getActive: async (userId) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create goal
  create: async (userId, goal) => {
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update goal (triggers milestone check)
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete goal
  delete: async (id) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get milestones for a goal
  getMilestones: async (goalId) => {
    const { data, error } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('percentage', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Mark milestone as celebrated
  celebrateMilestone: async (milestoneId) => {
    const { data, error } = await supabase
      .from('goal_milestones')
      .update({ celebrated: true })
      .eq('id', milestoneId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to changes
  subscribe: (userId, callback) => {
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// ================================================
// BILLS
// ================================================

export const billsService = {
  // Get all bills
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get upcoming bills
  getUpcoming: async (userId, daysAhead = 30) => {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', today)
      .lte('due_date', futureDate)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create bill
  create: async (userId, bill) => {
    const { data, error } = await supabase
      .from('bills')
      .insert([{ ...bill, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update bill
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mark as paid
  markPaid: async (id, isPaid = true) => {
    const { data, error } = await supabase
      .from('bills')
      .update({ is_paid: isPaid })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete bill
  delete: async (id) => {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to changes
  subscribe: (userId, callback) => {
    const channel = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// ================================================
// ALERTS
// ================================================

export const alertsService = {
  // Get all alerts
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('spending_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get unread alerts
  getUnread: async (userId) => {
    const { data, error } = await supabase
      .from('spending_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Mark as read
  markRead: async (id) => {
    const { data, error } = await supabase
      .from('spending_alerts')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mark all as read
  markAllRead: async (userId) => {
    const { data, error } = await supabase
      .from('spending_alerts')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to new alerts
  subscribe: (userId, callback) => {
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'spending_alerts',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// ================================================
// USER SETTINGS
// ================================================

export const settingsService = {
  // Get settings
  get: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update settings
  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ================================================
// ANALYTICS
// ================================================

export const analyticsService = {
  // Get spending by category
  getSpendingByCategory: async (userId, startDate, endDate) => {
    const { data, error } = await supabase
      .rpc('get_spending_by_category', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      });
    
    if (error) throw error;
    return data;
  },
};
