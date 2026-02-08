// Form validation utilities

export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return 'Please enter a valid number';
  }
  
  if (numAmount <= 0) {
    return 'Amount must be greater than 0';
  }
  
  if (numAmount > 1000000000) {
    return 'Amount is too large';
  }
  
  return null;
};

export const validateDescription = (description, required = false) => {
  if (required && (!description || description.trim() === '')) {
    return 'Description is required';
  }
  
  if (description && description.length > 200) {
    return 'Description is too long (max 200 characters)';
  }
  
  return null;
};

export const validateCategory = (category, required = false) => {
  if (required && !category) {
    return 'Please select a category';
  }
  
  return null;
};

export const validateDate = (date, allowFuture = false) => {
  if (!date) {
    return 'Date is required';
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!allowFuture && selectedDate > today) {
    return 'Date cannot be in the future';
  }
  
  const minDate = new Date('2000-01-01');
  if (selectedDate < minDate) {
    return 'Date is too far in the past';
  }
  
  return null;
};

export const validateGoalAmount = (current, target) => {
  if (parseFloat(current) < 0) {
    return 'Current amount cannot be negative';
  }
  
  if (parseFloat(target) <= 0) {
    return 'Target amount must be greater than 0';
  }
  
  return null;
};
