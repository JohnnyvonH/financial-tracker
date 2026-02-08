/**
 * Migration utility to move data from localStorage to Supabase
 * Run this once after user signs in for the first time
 */

import {
  transactionsService,
  budgetsService,
  goalsService,
  billsService,
} from '../services/database';

export const migrateLocalDataToSupabase = async (userId) => {
  console.log('🔄 Starting data migration to Supabase...');
  
  try {
    const migrationStatus = {
      transactions: { success: 0, failed: 0 },
      budgets: { success: 0, failed: 0 },
      goals: { success: 0, failed: 0 },
      bills: { success: 0, failed: 0 },
    };

    // ================================================
    // MIGRATE TRANSACTIONS
    // ================================================
    const localTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    console.log(`📝 Migrating ${localTransactions.length} transactions...`);
    
    for (const transaction of localTransactions) {
      try {
        // Remove id if it exists (Supabase will generate new UUIDs)
        const { id, ...transactionData } = transaction;
        await transactionsService.create(userId, transactionData);
        migrationStatus.transactions.success++;
      } catch (error) {
        console.error('Failed to migrate transaction:', error);
        migrationStatus.transactions.failed++;
      }
    }

    // ================================================
    // MIGRATE BUDGETS
    // ================================================
    const localBudgets = JSON.parse(localStorage.getItem('budgets') || '{}');
    const budgetEntries = Object.entries(localBudgets);
    console.log(`💰 Migrating ${budgetEntries.length} budgets...`);
    
    for (const [category, amount] of budgetEntries) {
      try {
        await budgetsService.create(userId, {
          category,
          amount,
          period: 'monthly',
        });
        migrationStatus.budgets.success++;
      } catch (error) {
        console.error('Failed to migrate budget:', error);
        migrationStatus.budgets.failed++;
      }
    }

    // ================================================
    // MIGRATE GOALS
    // ================================================
    const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    console.log(`🎯 Migrating ${localGoals.length} goals...`);
    
    for (const goal of localGoals) {
      try {
        const { id, ...goalData } = goal;
        await goalsService.create(userId, {
          name: goalData.name,
          target_amount: goalData.targetAmount,
          current_amount: goalData.currentAmount || 0,
          deadline: goalData.deadline || null,
        });
        migrationStatus.goals.success++;
      } catch (error) {
        console.error('Failed to migrate goal:', error);
        migrationStatus.goals.failed++;
      }
    }

    // ================================================
    // MIGRATE BILLS
    // ================================================
    const localBills = JSON.parse(localStorage.getItem('bills') || '[]');
    console.log(`📅 Migrating ${localBills.length} bills...`);
    
    for (const bill of localBills) {
      try {
        const { id, ...billData } = bill;
        await billsService.create(userId, {
          name: billData.name,
          amount: billData.amount,
          due_date: billData.dueDate,
          frequency: billData.frequency || 'monthly',
          is_paid: billData.isPaid || false,
        });
        migrationStatus.bills.success++;
      } catch (error) {
        console.error('Failed to migrate bill:', error);
        migrationStatus.bills.failed++;
      }
    }

    // ================================================
    // SUMMARY
    // ================================================
    console.log('✅ Migration complete!');
    console.log('Summary:', migrationStatus);

    const totalSuccess = 
      migrationStatus.transactions.success +
      migrationStatus.budgets.success +
      migrationStatus.goals.success +
      migrationStatus.bills.success;

    const totalFailed =
      migrationStatus.transactions.failed +
      migrationStatus.budgets.failed +
      migrationStatus.goals.failed +
      migrationStatus.bills.failed;

    // Mark migration as complete
    localStorage.setItem('migration_complete', 'true');
    localStorage.setItem('migration_date', new Date().toISOString());

    return {
      success: true,
      status: migrationStatus,
      totalSuccess,
      totalFailed,
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const isMigrationComplete = () => {
  return localStorage.getItem('migration_complete') === 'true';
};

export const clearLocalData = () => {
  const keysToKeep = ['migration_complete', 'migration_date', 'financial-tracker-auth'];
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('🧹 Local data cleared (keeping migration markers)');
};
