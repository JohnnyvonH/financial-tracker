import { getCommitmentProjection, getRecurringMonthlySummary, getSnapshotTotals } from './financeSummary';

const toNumber = (value) => Number(value || 0);

export function getScenarioProjection({
  planningItems = [],
  latestSnapshot,
  recurringTransactions = [],
  horizonDays = 90,
  extraCost = 0,
  monthlyCapacityAdjustment = 0,
  delayAssetSales = false,
} = {}) {
  const snapshotTotals = getSnapshotTotals(latestSnapshot);
  const monthlySummary = getRecurringMonthlySummary(recurringTransactions, latestSnapshot);
  const baseline = getCommitmentProjection(
    planningItems.filter((item) => item.type !== 'saving'),
    snapshotTotals,
    horizonDays
  );
  const scenarioAssetSales = delayAssetSales ? 0 : baseline.assetSales;
  const baselineCapacityOverHorizon = monthlySummary.surplus * (horizonDays / 30);
  const baselineProjectedMaxCash = baseline.projectedMaxCash + baselineCapacityOverHorizon;
  const adjustedCapacity = monthlySummary.surplus + toNumber(monthlyCapacityAdjustment);
  const capacityOverHorizon = adjustedCapacity * (horizonDays / 30);
  const scenarioCosts = baseline.costs + toNumber(extraCost);
  const projectedMaxCash = snapshotTotals.maxAvailableCash + scenarioAssetSales - scenarioCosts + capacityOverHorizon;

  return {
    baseline: {
      ...baseline,
      planOnlyProjectedMaxCash: baseline.projectedMaxCash,
      capacityOverHorizon: baselineCapacityOverHorizon,
      projectedMaxCash: baselineProjectedMaxCash,
    },
    monthlySummary,
    scenario: {
      costs: scenarioCosts,
      assetSales: scenarioAssetSales,
      capacityOverHorizon,
      projectedMaxCash,
      netCommitmentImpact: scenarioAssetSales - scenarioCosts,
      fundingGap: Math.max(0, -projectedMaxCash),
      horizonDays,
    },
    deltas: {
      projectedMaxCash: projectedMaxCash - baselineProjectedMaxCash,
      costs: scenarioCosts - baseline.costs,
      assetSales: scenarioAssetSales - baseline.assetSales,
    },
  };
}
