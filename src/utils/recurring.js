// Recurring transaction utilities

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = String(dateString).split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatLocalDate = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const addFrequency = (date, frequency) => {
  const nextDate = new Date(date);
  
  switch (frequency) {
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
    default:
      break;
  }

  return nextDate;
};

export const calculateNextDate = (startDate, frequency) => {
  const date = parseLocalDate(startDate);
  if (!date) return '';
  
  return formatLocalDate(addFrequency(date, frequency));
};

export const getUpcomingRecurringOccurrences = (
  recurringTransactions = [],
  { limit = 8, horizonDays = 45, referenceDate = new Date() } = {}
) => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + horizonDays);
  const occurrences = [];

  recurringTransactions.forEach((item) => {
    if (item.active === false || item.is_active === false) return;

    const startDate = parseLocalDate(item.nextDate || item.next_date || item.startDate || item.start_date);
    if (!startDate) return;

    const lastProcessedDate = parseLocalDate(item.lastProcessed || item.last_processed || item.last_generated_date);
    let nextDate = lastProcessedDate
      ? addFrequency(lastProcessedDate, item.frequency)
      : startDate;

    while (nextDate < today) {
      nextDate = addFrequency(nextDate, item.frequency);
    }

    const endDate = parseLocalDate(item.endDate || item.end_date);
    if ((endDate && nextDate > endDate) || nextDate > horizon) return;

    occurrences.push({
      id: `${item.id || item.description}-${formatLocalDate(nextDate)}`,
      item,
      date: formatLocalDate(nextDate),
      dateValue: nextDate.getTime(),
      daysAway: Math.round((nextDate - today) / (24 * 60 * 60 * 1000)),
    });
  });

  return occurrences
    .sort((a, b) => a.dateValue - b.dateValue)
    .slice(0, limit);
};

export const shouldProcessRecurring = (recurringTransaction) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Use start_date if it exists (Supabase format), otherwise use nextDate or startDate
  const startDate = parseLocalDate(recurringTransaction.start_date || recurringTransaction.startDate);
  if (!startDate) return false;
  startDate.setHours(0, 0, 0, 0);
  
  // Check if we've already processed for today
  if (recurringTransaction.last_processed || recurringTransaction.lastProcessed) {
    const lastProcessed = parseLocalDate(recurringTransaction.last_processed || recurringTransaction.lastProcessed);
    if (!lastProcessed) return false;
    lastProcessed.setHours(0, 0, 0, 0);
    
    // If already processed today or in the future, skip
    if (lastProcessed >= today) {
      return false;
    }
    
    // Calculate next due date from last processed
    const nextDate = addFrequency(lastProcessed, recurringTransaction.frequency);
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
  
  // Create a map of existing transaction descriptions and dates for duplicate detection
  const existingMap = new Map();
  existingTransactions.forEach(t => {
    const key = `${t.description}-${t.category}-${t.amount}-${t.date}`;
    existingMap.set(key, true);
  });
  
  recurringTransactions.forEach(recurring => {
    // Skip if already processed today
    const lastProcessed = recurring.last_processed || recurring.lastProcessed;
    if (lastProcessed) {
      const lastDate = new Date(lastProcessed);
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate >= today) {
        updatedRecurring.push(recurring);
        return;
      }
    }
    
    if (shouldProcessRecurring(recurring)) {
      // Check if we already have this exact transaction today
      const transactionKey = `${recurring.description}-${recurring.category}-${recurring.amount}-${todayStr}`;
      const alreadyExists = existingMap.has(transactionKey);
      
      if (!alreadyExists) {
        // Create new transaction
        newTransactions.push({
          id: recurring.id || Date.now(), // Use Supabase ID if available
          type: recurring.type,
          amount: Number(recurring.amount),
          description: recurring.description,
          category: recurring.category,
          date: todayStr,
          timestamp: Date.now()
        });
        
        // Mark as added to avoid duplicates in this processing batch
        existingMap.set(transactionKey, true);
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
