const toNumber = (value) => Number(value || 0);

const monthWindow = (offset = 0, referenceDate = new Date()) => {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + offset, 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + offset + 1, 0, 23, 59, 59, 999);

  return { start, end };
};

const inWindow = (dateString, window) => {
  const date = new Date(dateString);
  return date >= window.start && date <= window.end;
};

export function getMonthlyTransactionComparison(transactions = [], referenceDate = new Date()) {
  const summarise = (window) => transactions
    .filter((transaction) => inWindow(transaction.date, window))
    .reduce((summary, transaction) => {
      const amount = toNumber(transaction.amount);
      if (transaction.type === 'income') {
        summary.income += amount;
      } else {
        summary.expenses += amount;
      }
      summary.count += 1;
      return summary;
    }, { income: 0, expenses: 0, count: 0 });

  const current = summarise(monthWindow(0, referenceDate));
  const previous = summarise(monthWindow(-1, referenceDate));

  return {
    current,
    previous,
    deltas: {
      income: current.income - previous.income,
      expenses: current.expenses - previous.expenses,
      net: (current.income - current.expenses) - (previous.income - previous.expenses),
    },
  };
}

export function getPlanningReportSummary(planningItems = []) {
  return planningItems.reduce((summary, item) => {
    if (item.status === 'complete') {
      summary.completed += 1;
      return summary;
    }

    const value = item.type === 'asset-sale'
      ? toNumber(item.expectedValue || item.targetAmount)
      : Math.max(toNumber(item.targetAmount) - toNumber(item.savedAmount), 0);

    if (item.type === 'asset-sale') {
      summary.expectedAssetSales += value;
    } else if (item.type === 'saving') {
      summary.savingsTargets += value;
    } else {
      summary.upcomingCosts += value;
    }

    if (item.priority === 'high') {
      summary.highPriority += 1;
    }

    if (item.dueDate) {
      summary.dated += 1;
    } else {
      summary.undated += 1;
    }

    return summary;
  }, {
    upcomingCosts: 0,
    expectedAssetSales: 0,
    savingsTargets: 0,
    highPriority: 0,
    dated: 0,
    undated: 0,
    completed: 0,
  });
}
