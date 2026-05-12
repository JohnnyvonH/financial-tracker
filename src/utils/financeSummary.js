const toNumber = (value) => Number(value || 0);
const hasValue = (value) => value !== undefined && value !== null && value !== '';
const hasPositiveValue = (value) => hasValue(value) && toNumber(value) > 0;

export function getSnapshotTotals(snapshot = {}) {
  const moneyboxBreakdownTotal = [
    snapshot.moneyboxStocksSharesIsa,
    snapshot.moneyboxLifetimeIsa,
    snapshot.moneyboxSimpleSaver,
    snapshot.moneyboxCashIsa,
    snapshot.moneyboxMonthly,
  ].reduce((sum, value) => sum + toNumber(value), 0);

  const moneyboxTotal = hasPositiveValue(snapshot.moneybox)
    ? toNumber(snapshot.moneybox)
    : moneyboxBreakdownTotal;

  const calculatedTotal = [
    snapshot.santander,
    snapshot.tesco,
    snapshot.amexCashback,
    moneyboxTotal,
    snapshot.paycheck,
  ].reduce((sum, value) => sum + toNumber(value), 0);

  const total = hasPositiveValue(snapshot.total)
    ? toNumber(snapshot.total)
    : calculatedTotal;

  const calculatedAvailableAssets = Math.max(total - toNumber(snapshot.moneyboxLifetimeIsa), 0);
  const availableAssets = hasPositiveValue(snapshot.totalValueAvailableAssets)
    ? toNumber(snapshot.totalValueAvailableAssets)
    : calculatedAvailableAssets;

  const calculatedAllAssets = total + toNumber(snapshot.pension);
  const allAssets = hasPositiveValue(snapshot.totalValueAllAssets)
    ? toNumber(snapshot.totalValueAllAssets)
    : calculatedAllAssets;

  return {
    moneyboxBreakdownTotal,
    moneyboxTotal,
    moneyboxVariance: moneyboxTotal - moneyboxBreakdownTotal,
    calculatedTotal,
    total,
    totalVariance: total - calculatedTotal,
    calculatedAvailableAssets,
    availableAssets,
    bankNextPaycheck: toNumber(snapshot.estimatedBankNextPaycheck),
    calculatedAllAssets,
    allAssets,
  };
}

export function getPlanSummary(planningItems = []) {
  return planningItems.reduce((summary, item) => {
    if (item.status === 'complete') {
      summary.completed += 1;
      return summary;
    }

    if (item.type === 'asset-sale') {
      summary.expectedIncome += toNumber(item.expectedValue);
    } else {
      summary.upcomingCosts += toNumber(item.targetAmount);
      summary.alreadySaved += toNumber(item.savedAmount);
    }

    if (item.priority === 'high') summary.highPriority += 1;
    return summary;
  }, {
    upcomingCosts: 0,
    alreadySaved: 0,
    expectedIncome: 0,
    highPriority: 0,
    completed: 0,
  });
}

export function getGoalSummary(goals = []) {
  const target = goals.reduce((sum, goal) => sum + toNumber(goal.target), 0);
  const saved = goals.reduce((sum, goal) => sum + toNumber(goal.current), 0);

  return {
    target,
    saved,
    remaining: Math.max(target - saved, 0),
    progress: target > 0 ? Math.min((saved / target) * 100, 100) : 0,
  };
}

export function getTransactionsForWindow(transactions = [], days = 30) {
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= start && date <= now;
  });
}

export function getCategorySpending(transactions = [], days = 30) {
  const expenses = getTransactionsForWindow(transactions, days)
    .filter((transaction) => transaction.type === 'expense');

  return expenses.reduce((categories, transaction) => {
    const category = transaction.category || 'Other';
    categories[category] = (categories[category] || 0) + toNumber(transaction.amount);
    return categories;
  }, {});
}

export function getUpcomingPlanningItems(planningItems = [], limit = 5) {
  return [...planningItems]
    .filter((item) => item.status !== 'complete')
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, limit);
}

export function getFinanceInsights({
  balance = 0,
  monthlyIncome = 0,
  monthlyExpenses = 0,
  planningItems = [],
  goals = [],
  netWorthSnapshots = [],
}) {
  const plan = getPlanSummary(planningItems);
  const goalsSummary = getGoalSummary(goals);
  const fundingGap = Math.max(plan.upcomingCosts - plan.alreadySaved - plan.expectedIncome, 0);
  const surplus = monthlyIncome - monthlyExpenses;
  const latestSnapshot = netWorthSnapshots[0];
  const latestTotals = getSnapshotTotals(latestSnapshot);
  const insights = [];

  if (fundingGap > 0) {
    insights.push({
      tone: 'warning',
      title: 'Funding gap to plan for',
      message: `${fundingGap.toFixed(0)} still needs to be covered across upcoming commitments after saved funds and expected sales.`,
    });
  } else if (planningItems.length > 0) {
    insights.push({
      tone: 'positive',
      title: 'Upcoming plan is funded',
      message: 'Current saved amounts and expected sale proceeds cover your active plan items.',
    });
  }

  if (monthlyIncome > 0) {
    const savingsRate = (surplus / monthlyIncome) * 100;
    insights.push({
      tone: surplus >= 0 ? 'positive' : 'danger',
      title: surplus >= 0 ? 'Monthly surplus' : 'Monthly shortfall',
      message: `${Math.abs(savingsRate).toFixed(0)}% ${surplus >= 0 ? 'left after spending' : 'overspend versus income'} in the current month.`,
    });
  }

  if (goalsSummary.remaining > 0) {
    insights.push({
      tone: 'info',
      title: 'Savings goal runway',
      message: `${goalsSummary.progress.toFixed(0)}% complete across goals, with ${goalsSummary.remaining.toFixed(0)} remaining.`,
    });
  }

  if (latestTotals.availableAssets > 0 && balance > latestTotals.availableAssets) {
    insights.push({
      tone: 'info',
      title: 'Snapshot may need refreshing',
      message: 'Your current balance is higher than the latest available-assets snapshot.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      tone: 'info',
      title: 'Add your first data points',
      message: 'Add transactions, goals, and plan items to unlock useful guidance.',
    });
  }

  return insights.slice(0, 4);
}
