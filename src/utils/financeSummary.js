import { DEFAULT_SNAPSHOT_SECTIONS, getSnapshotEntries } from './snapshotConfig';

const toNumber = (value) => Number(value || 0);

const isActiveRecurring = (item = {}) => item.active !== false && item.is_active !== false;

const getRecurringType = (item = {}) => String(item.type || '').toLowerCase();

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const getPlanningValue = (item = {}) => (
  item.type === 'asset-sale'
    ? toNumber(item.expectedValue || item.targetAmount)
    : toNumber(item.targetAmount)
);

const parseDateInput = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = String(dateString).split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

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
  const entries = getSnapshotEntries(snapshot, DEFAULT_SNAPSHOT_SECTIONS);
  const sumByType = (types) => entries
    .filter((entry) => types.includes(entry.type))
    .reduce((sum, entry) => sum + toNumber(entry.value), 0);

  const availableCash = sumByType(['available_cash']);
  const cardLiabilities = sumByType(['liability']);
  const moneyboxMonthly = sumByType(['monthly_outgoing']);
  const savings = sumByType(['savings']);
  const restrictedSavings = sumByType(['restricted_savings']);
  const investments = sumByType(['investment']);
  const pension = sumByType(['pension']);
  const paycheck = sumByType(['income_context']);
  const santander = toNumber(snapshot.santander || availableCash);
  const lifetimeIsa = toNumber(snapshot.moneyboxLifetimeIsa || restrictedSavings);
  const moneyboxBreakdownValues = [
    snapshot.moneyboxStocksSharesIsa,
    snapshot.moneyboxLifetimeIsa,
    snapshot.moneyboxSimpleSaver,
    snapshot.moneyboxCashIsa,
  ];
  const hasMoneyboxBreakdown = moneyboxBreakdownValues.some(hasValue);
  const moneyboxBreakdownTotal = moneyboxBreakdownValues.reduce((sum, value) => sum + toNumber(value), 0);

  const moneyboxTotal = hasMoneyboxBreakdown ? moneyboxBreakdownTotal : toNumber(snapshot.moneybox);
  const savingsAndInvestments = savings + restrictedSavings + investments;
  const assetAccountTotal = savingsAndInvestments || moneyboxTotal;
  const cashAfterCards = availableCash - cardLiabilities;
  const maxAvailableCash = cashAfterCards - moneyboxMonthly;
  const availableMoneybox = assetAccountTotal - lifetimeIsa;
  const availableAssets = maxAvailableCash + savings + investments;
  const houseDepositAccessibleAssets = availableAssets + restrictedSavings;
  const allAssets = cashAfterCards + assetAccountTotal + pension;

  return {
    santander,
    cardLiabilities,
    cashAfterCards,
    moneyboxMonthly,
    moneyboxBreakdownTotal,
    moneyboxTotal: assetAccountTotal,
    moneyboxVariance: hasValue(snapshot.moneybox) ? toNumber(snapshot.moneybox) - moneyboxBreakdownTotal : 0,
    maxAvailableCash,
    availableMoneybox,
    lifetimeIsa: restrictedSavings || lifetimeIsa,
    availableAssets,
    houseDepositAccessibleAssets,
    total: allAssets,
    allAssets,
    pension,
    paycheck,
  };
}

export function getRecurringMonthlySummary(recurringTransactions = [], latestSnapshot = {}) {
  const activeRecurring = recurringTransactions.filter(isActiveRecurring);
  const summary = activeRecurring.reduce((result, item) => {
    const monthlyAmount = getMonthlyEquivalent(item.amount, item.frequency);
    const type = getRecurringType(item);
    const category = item.category || (type === 'income' ? 'Other Income' : 'Other');

    if (type === 'income') {
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
      summary.expectedIncome += getPlanningValue(item);
    } else {
      summary.upcomingCosts += getPlanningValue(item);
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
      if (!item.dueDate) return false;
      const dueDate = parseDateInput(item.dueDate);
      if (!dueDate) return false;
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= now && dueDate <= horizon;
    });

  const summary = commitments.reduce((result, item) => {
    if (item.type === 'asset-sale') {
      result.assetSales += getPlanningValue(item);
    } else {
      result.costs += Math.max(getPlanningValue(item) - toNumber(item.savedAmount), 0);
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
  budgets = {},
  transactions = [],
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
  const previousSnapshot = netWorthSnapshots[1];
  const previousTotals = getSnapshotTotals(previousSnapshot);
  const currentMonthTransactions = transactions.filter((transaction) => {
    const date = parseDateInput(transaction.date);
    const now = new Date();
    return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const spendingByCategory = currentMonthTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((summary, transaction) => {
      const category = transaction.category || 'Other';
      summary[category] = (summary[category] || 0) + toNumber(transaction.amount);
      return summary;
    }, {});
  const insights = [];

  if (fundingGap > 0) {
    const coveredByMonthlyCapacity = surplus >= fundingGap;

    insights.push({
      tone: coveredByMonthlyCapacity ? 'positive' : 'warning',
      title: coveredByMonthlyCapacity ? 'Plan fits this month' : 'Funding gap to plan for',
      message: coveredByMonthlyCapacity
        ? `${fundingGap.toFixed(0)} still needs covering, but it fits within your monthly capacity of ${surplus.toFixed(0)}.`
        : `${fundingGap.toFixed(0)} still needs to be covered across upcoming commitments after saved funds and expected sales.`,
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

  Object.entries(budgets).forEach(([category, budget]) => {
    const spent = spendingByCategory[category] || 0;
    const limit = toNumber(budget);
    if (limit <= 0 || spent <= 0) return;

    const usage = (spent / limit) * 100;
    if (usage >= 90) {
      insights.push({
        tone: usage >= 100 ? 'danger' : 'warning',
        title: `${category} budget pressure`,
        message: `${usage.toFixed(0)}% of this month's ${category} budget is already used.`,
      });
    }
  });

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

  if (latestSnapshot?.date) {
    const snapshotDate = parseDateInput(latestSnapshot.date);
    const daysOld = snapshotDate
      ? Math.floor((new Date() - snapshotDate) / (24 * 60 * 60 * 1000))
      : 0;

    if (daysOld > 21) {
      insights.push({
        tone: 'warning',
        title: 'Current finances are getting stale',
        message: `Your latest snapshot is ${daysOld} days old. Refresh it before relying on forecasts.`,
      });
    }
  }

  if (previousSnapshot) {
    const wealthDelta = latestTotals.allAssets - previousTotals.allAssets;
    insights.push({
      tone: wealthDelta >= 0 ? 'positive' : 'warning',
      title: wealthDelta >= 0 ? 'Net worth moved up' : 'Net worth moved down',
      message: `${Math.abs(wealthDelta).toFixed(0)} ${wealthDelta >= 0 ? 'increase' : 'decrease'} since the previous current-finances snapshot.`,
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
