// Recurring transaction utilities

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

export const calculateNextDate = (startDate, frequency) => {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      break;
  }
  
  return date.toISOString().split('T')[0];
};

export const shouldProcessRecurring = (recurringTransaction) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Use start_date if it exists (Supabase format), otherwise use nextDate or startDate
  const startDate = new Date(recurringTransaction.start_date || recurringTransaction.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  // Check if we've already processed for today
  if (recurringTransaction.last_processed || recurringTransaction.lastProcessed) {
    const lastProcessed = new Date(recurringTransaction.last_processed || recurringTransaction.lastProcessed);
    lastProcessed.setHours(0, 0, 0, 0);
    
    // If already processed today, skip
    if (lastProcessed.getTime() === today.getTime()) {
      return false;
    }
    
    // Calculate next due date from last processed
    const nextDate = new Date(lastProcessed);
    switch (recurringTransaction.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    nextDate.setHours(0, 0, 0, 0);
    
    // Only process if we're past the next date
    return today >= nextDate;
  }
  
  // First time processing - check if we're past the start date
  return today >= startDate;
};

export const processRecurringTransactions = (recurringTransactions, existingTransactions = []) => {
  const newTransactions = [];
  const updatedRecurring = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  recurringTransactions.forEach(recurring => {
    // Skip if already processed today
    const lastProcessed = recurring.last_processed || recurring.lastProcessed;
    if (lastProcessed) {
      const lastDate = new Date(lastProcessed);
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() === today.getTime()) {
        updatedRecurring.push(recurring);
        return;
      }
    }
    
    if (shouldProcessRecurring(recurring)) {
      // Check if we already have a transaction for this recurring item today
      const alreadyExists = existingTransactions.some(t => 
        t.recurringId === recurring.id && 
        t.date === todayStr
      );
      
      if (!alreadyExists) {
        // Create new transaction with unique ID
        const transactionId = `recurring-${recurring.id}-${Date.now()}`;
        newTransactions.push({
          id: transactionId,
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          category: recurring.category,
          date: todayStr,
          recurring: true,
          recurringId: recurring.id,
          timestamp: Date.now()
        });
      }
      
      // Update last processed date
      updatedRecurring.push({
        ...recurring,
        last_processed: todayStr,
        lastProcessed: todayStr
      });
    } else {
      updatedRecurring.push(recurring);
    }
  });
  
  return { newTransactions, updatedRecurring };
};

export const getFrequencyLabel = (frequency) => {
  const option = FREQUENCY_OPTIONS.find(opt => opt.value === frequency);
  return option ? option.label : frequency;
};
