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
  
  const nextDate = new Date(recurringTransaction.nextDate);
  nextDate.setHours(0, 0, 0, 0);
  
  // Check if end date is set and passed
  if (recurringTransaction.endDate) {
    const endDate = new Date(recurringTransaction.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (today > endDate) {
      return false;
    }
  }
  
  return today >= nextDate;
};

export const processRecurringTransactions = (recurringTransactions) => {
  const newTransactions = [];
  const updatedRecurring = [];
  
  recurringTransactions.forEach(recurring => {
    if (shouldProcessRecurring(recurring)) {
      // Create new transaction
      newTransactions.push({
        id: Date.now() + Math.random(),
        type: recurring.type,
        amount: recurring.amount,
        description: recurring.description,
        category: recurring.category,
        date: recurring.nextDate,
        recurring: true,
        recurringId: recurring.id,
        timestamp: Date.now()
      });
      
      // Update next date
      updatedRecurring.push({
        ...recurring,
        nextDate: calculateNextDate(recurring.nextDate, recurring.frequency),
        lastProcessed: new Date().toISOString()
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
