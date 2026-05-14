const toNumber = (value) => Number(value || 0);

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
