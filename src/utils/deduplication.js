/**
 * Utility to remove duplicate transactions
 * Duplicates are identified by matching: description, category, amount, and date
 */

export const removeDuplicateTransactions = (transactions) => {
  const seen = new Map();
  const unique = [];
  
  // Sort by timestamp (oldest first) to keep the original
  const sorted = [...transactions].sort((a, b) => 
    (a.timestamp || 0) - (b.timestamp || 0)
  );
  
  sorted.forEach(transaction => {
    // Create a unique key based on transaction details
    const key = [
      transaction.description?.trim().toLowerCase(),
      transaction.category?.trim().toLowerCase(),
      Number(transaction.amount).toFixed(2),
      transaction.date,
      transaction.type
    ].join('|');
    
    // Only keep the first occurrence
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(transaction);
    } else {
      console.log('Removing duplicate:', transaction.description, transaction.date);
    }
  });
  
  return unique;
};

/**
 * Count how many duplicates exist
 */
export const countDuplicates = (transactions) => {
  const seen = new Map();
  let duplicates = 0;
  
  transactions.forEach(transaction => {
    const key = [
      transaction.description?.trim().toLowerCase(),
      transaction.category?.trim().toLowerCase(),
      Number(transaction.amount).toFixed(2),
      transaction.date,
      transaction.type
    ].join('|');
    
    if (seen.has(key)) {
      duplicates++;
    } else {
      seen.set(key, true);
    }
  });
  
  return duplicates;
};

/**
 * Group duplicate transactions for review
 */
export const findDuplicates = (transactions) => {
  const groups = new Map();
  
  transactions.forEach(transaction => {
    const key = [
      transaction.description?.trim().toLowerCase(),
      transaction.category?.trim().toLowerCase(),
      Number(transaction.amount).toFixed(2),
      transaction.date,
      transaction.type
    ].join('|');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(transaction);
  });
  
  // Return only groups with duplicates
  const duplicateGroups = [];
  groups.forEach((group, key) => {
    if (group.length > 1) {
      duplicateGroups.push({
        key,
        count: group.length,
        transactions: group
      });
    }
  });
  
  return duplicateGroups;
};
