// Export utilities

export const exportToCSV = (transactions, filename = 'transactions.csv') => {
  if (transactions.length === 0) {
    return false;
  }

  // CSV headers
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  
  // Convert transactions to CSV rows
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.category,
    `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
    t.amount.toFixed(2)
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};

export const exportGoalsToCSV = (goals, filename = 'goals.csv') => {
  if (goals.length === 0) {
    return false;
  }

  const headers = ['Goal Name', 'Target Amount', 'Current Amount', 'Progress %'];
  
  const rows = goals.map(g => [
    `"${g.name.replace(/"/g, '""')}"`,
    g.target.toFixed(2),
    g.current.toFixed(2),
    ((g.current / g.target) * 100).toFixed(2)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};

export const exportBudgetsToCSV = (budgets, spending, filename = 'budgets.csv') => {
  const entries = Object.entries(budgets);
  if (entries.length === 0) {
    return false;
  }

  const headers = ['Category', 'Budget', 'Spent', 'Remaining', 'Usage %'];
  
  const rows = entries.map(([category, budget]) => {
    const spent = spending[category] || 0;
    const remaining = budget - spent;
    const usage = (spent / budget) * 100;
    
    return [
      `"${category}"`,
      budget.toFixed(2),
      spent.toFixed(2),
      remaining.toFixed(2),
      usage.toFixed(2)
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};

export const exportMonthlyFlowToCSV = ({
  recurringTransactions = [],
  latestSnapshot,
  monthlySummary,
}, filename = 'monthly-flow.csv') => {
  const rows = recurringTransactions
    .filter((item) => item.active !== false && item.is_active !== false)
    .map((item) => {
      const frequency = item.frequency || 'monthly';
      const amount = Number(item.amount || 0);
      const monthlyAmount = frequency === 'daily'
        ? (amount * 365) / 12
        : frequency === 'weekly'
          ? (amount * 52) / 12
          : frequency === 'biweekly'
            ? (amount * 26) / 12
            : frequency === 'quarterly'
              ? amount / 3
              : frequency === 'yearly'
                ? amount / 12
                : amount;

      return [
        item.type === 'income' ? 'Income' : 'Outgoing',
        `"${String(item.category || '').replace(/"/g, '""')}"`,
        `"${String(item.description || '').replace(/"/g, '""')}"`,
        frequency,
        amount.toFixed(2),
        monthlyAmount.toFixed(2),
      ];
    });

  if (latestSnapshot?.moneyboxMonthly) {
    rows.push([
      'Outgoing',
      '"MoneyBox Monthly"',
      '"Current finances snapshot commitment"',
      'monthly',
      Number(latestSnapshot.moneyboxMonthly || 0).toFixed(2),
      Number(latestSnapshot.moneyboxMonthly || 0).toFixed(2),
    ]);
  }

  const summaryRows = monthlySummary ? [
    [],
    ['Summary'],
    ['Monthly Income', Number(monthlySummary.income || 0).toFixed(2)],
    ['Known Outgoings', Number(monthlySummary.outgoings || 0).toFixed(2)],
    ['Monthly Capacity', Number(monthlySummary.surplus || 0).toFixed(2)],
  ] : [];

  if (rows.length === 0 && summaryRows.length === 0) {
    return false;
  }

  const csvContent = [
    ['Type', 'Category', 'Description', 'Frequency', 'Amount', 'Monthly Equivalent'].join(','),
    ...rows.map(row => row.join(',')),
    ...summaryRows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};
