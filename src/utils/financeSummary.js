const toNumber = (value) => Number(value || 0);

export function getMonthlyEquivalent(amount = 0, frequency = 'monthly') {
  const value = toNumber(amount);

  switch (frequency) {
    case 'daily':
      return (value * 365) / 12;
    case 'weekly':
      return (value * 52) / 12;
    case 'biweekly':
      return (value * 26) / 12;
    case 'quarterly':
      return value / 3;
    case 'yearly':
      return value / 12;
    case 'monthly':
    default:
      return value;
  }
}

export function getSnapshotTotals(snapshot = {}) {
  const santander = toNumber(snapshot.santander);
  const tesco = toNumber(snapshot.tesco);
  const amexCashback = toNumber(snapshot.amexCashback);
  const paycheck = toNumber(snapshot.paycheck);
  const pension = toNumber(snapshot.pension);
  const moneyboxMonthly = toNumber(snapshot.moneyboxMonthly);
  const lifetimeIsa = toNumber(snapshot.moneyboxLifetimeIsa);
  const moneyboxBreakdownTotal = [
    snapshot.moneyboxStocksSharesIsa,
    lifetimeIsa,
    snapshot.moneyboxSimpleSaver,
    snapshot.moneyboxCashIsa,
  ].reduce((sum, value) => sum + toNumber(value), 0);

  const moneyboxTotal = moneyboxBreakdownTotal;
  const cardLiabilities = tesco + amexCashback;
  const cashAfterCards = santander - cardLiabilities;
  const maxAvailableCash = cashAfterCards - moneyboxMonthly;
  const availableMoneybox = moneyboxTotal - lifetimeIsa;
  const availableAssets = maxAvailableCash + availableMoneybox;
  const houseDepositAccessibleAssets = availableAssets + lifetimeIsa;
  const allAssets = cashAfterCards + moneyboxTotal + pension;

  return {
    santander,
    cardLiabilities,
    cashAfterCards,
    moneyboxMonthly,
    moneyboxBreakdownTotal,
    moneyboxTotal,
    moneyboxVariance: toNumber(snapshot.moneybox || moneyboxBreakdownTotal) - moneyboxBreakdownTotal,
    maxAvailableCash,
    availableMoneybox,
    lifetimeIsa,
    availableAssets,
    houseDepositAccessibleAssets,
    total: allAssets,
    allAssets,
    pension,
    paycheck,
  };
}

export function getRecurringMonthlySummary(recurringTransactions = [], latestSnapshot = {}) {
  const activeRecurring = recurringTransactions.filter((item) => item.active !== false);
  const summary = activeRecurring.reduce((result, item) => {
    const monthlyAmount = getMonthlyEquivalent(item.amount, item.frequency);
    const category = item.category || (item.type === 'income' ? 'Other Income' : 'Other');

    if (item.type === 'income') {
      result.income += monthlyAmount;
    } else {
      result.expenses += monthlyAmount;
      result.byCategory[category] = (result.byCategory[category] || 0) + monthlyAmount;
    }

    return result;
  }, {
    income: 0,
    expenses: 0,
    byCategory: {},
  });

  const snapshotPaycheck = toNumber(latestSnapshot.paycheck);
  const income = summary.income > 0 ? summary.income : snapshotPaycheck;
  const moneyboxMonthly = toNumber(latestSnapshot.moneyboxMonthly);
  const outgoings = summary.expenses + moneyboxMonthly;

  if (moneyboxMonthly > 0) {
    summary.byCategory['MoneyBox Monthly'] = (summary.byCategory['MoneyBox Monthly'] || 0) + moneyboxMonthly;
  }

  return {
    income,
    recurringIncome: summary.income,
    snapshotPaycheck,
    recurringExpenses: summary.expenses,
    moneyboxMonthly,
    outgoings,
    surplus: income - outgoings,
    byCategory: summary.byCategory,
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

export function getCommitmentProjection(planningItems = [], snapshotTotals = {}, horizonDays = 90) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + horizonDays);

  const commitments = planningItems
    .filter((item) => item.status !== 'complete' && item.type !== 'saving')
    .filter((item) => {
      if (!item.dueDate) return true;
      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= horizon;
    });

  const summary = commitments.reduce((result, item) => {
    if (item.type === 'asset-sale') {
      result.assetSales += toNumber(item.expectedValue);
    } else {
      result.costs += Math.max(toNumber(item.targetAmount) - toNumber(item.savedAmount), 0);
    }
    return result;
  }, { costs: 0, assetSales: 0 });

  const maxAvailableCash = toNumber(snapshotTotals.maxAvailableCash);

  return {
    ...summary,
    netCommitmentImpact: summary.assetSales - summary.costs,
    projectedMaxCash: maxAvailableCash + summary.assetSales - summary.costs,
    horizonDays,
    commitmentCount: commitments.length,
  };
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

  if (latestTotals.maxAvailableCash > 0 && balance > latestTotals.maxAvailableCash) {
    insights.push({
      tone: 'info',
      title: 'Current finances may need refreshing',
      message: 'Your current balance is higher than the latest available cash after cards and MoneyBox monthly.',
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
