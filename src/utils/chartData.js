/**
 * Utility functions for processing transaction data for charts
 */

export function getMonthlyTrends(transactions, monthsToShow = 6) {
  const now = new Date();
  const trends = [];

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    trends.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income,
      expenses,
      net: income - expenses
    });
  }

  return trends;
}

export function getCategoryBreakdown(transactions) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthlyExpenses = transactions.filter(t => {
    const tDate = new Date(t.date);
    return t.type === 'expense' && 
           tDate.getMonth() === thisMonth && 
           tDate.getFullYear() === thisYear;
  });

  const categoryData = {};
  monthlyExpenses.forEach(t => {
    const category = t.category || 'Other';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += t.amount;
  });

  const colors = [
    '#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ef4444', '#ec4899',
    '#8b5cf6', '#14b8a6', '#f97316', '#84cc16'
  ];

  return Object.entries(categoryData)
    .map(([category, amount], index) => ({
      category,
      amount,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

export function getIncomeVsExpenses(transactions, monthsToShow = 6) {
  const now = new Date();
  const comparison = [];

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    comparison.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expenses
    });
  }

  return comparison;
}

export function getDailySpending(transactions, daysToShow = 14) {
  const now = new Date();
  const daily = [];

  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      return tDate.getTime() === date.getTime();
    });

    if (dayTransactions.length > 0) {
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      daily.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income,
        expenses,
        transactionCount: dayTransactions.length
      });
    }
  }

  return daily;
}
