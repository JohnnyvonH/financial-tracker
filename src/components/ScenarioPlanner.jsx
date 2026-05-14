import React, { useMemo, useState } from 'react';
import { CalendarClock, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getScenarioProjection } from '../utils/scenarioPlanner';

function ScenarioMetric({ label, value, detail, tone = 'neutral' }) {
  return (
    <article className={`scenario-metric scenario-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </article>
  );
}

const formatSignedCurrency = (amount, currency) => (
  amount < 0
    ? `-${formatCurrency(Math.abs(amount), currency)}`
    : formatCurrency(amount, currency)
);

export default function ScenarioPlanner({
  planningItems = [],
  latestSnapshot,
  recurringTransactions = [],
  currency = 'USD',
}) {
  const [extraCost, setExtraCost] = useState('');
  const [monthlyCapacityAdjustment, setMonthlyCapacityAdjustment] = useState('');
  const [delayAssetSales, setDelayAssetSales] = useState(false);

  const projection = useMemo(() => getScenarioProjection({
    planningItems,
    latestSnapshot,
    recurringTransactions,
    extraCost,
    monthlyCapacityAdjustment,
    delayAssetSales,
  }), [delayAssetSales, extraCost, latestSnapshot, monthlyCapacityAdjustment, planningItems, recurringTransactions]);

  const { baseline, monthlySummary, scenario, deltas } = projection;
  const scenarioTone = scenario.projectedMaxCash >= 0 ? 'positive' : 'danger';
  const deltaTone = deltas.projectedMaxCash >= 0 ? 'positive' : 'danger';

  return (
    <section className="panel scenario-planner" aria-label="What-if scenario planner">
      <div className="dashboard-section-header">
        <div>
          <h2>What-if scenario</h2>
          <p>Try temporary assumptions without changing your saved plan.</p>
        </div>
        <SlidersHorizontal size={20} />
      </div>

      <div className="scenario-controls">
        <div className="form-group">
          <label htmlFor="scenario-extra-cost">Extra one-off cost</label>
          <input
            id="scenario-extra-cost"
            type="number"
            min="0"
            step="0.01"
            value={extraCost}
            onChange={(event) => setExtraCost(event.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="form-group">
          <label htmlFor="scenario-capacity">Monthly capacity adjustment</label>
          <input
            id="scenario-capacity"
            type="number"
            step="0.01"
            value={monthlyCapacityAdjustment}
            onChange={(event) => setMonthlyCapacityAdjustment(event.target.value)}
            placeholder="0.00"
          />
        </div>
        <label className="scenario-toggle">
          <input
            type="checkbox"
            checked={delayAssetSales}
            onChange={(event) => setDelayAssetSales(event.target.checked)}
          />
          <span>Delay asset sales beyond 90 days</span>
        </label>
      </div>

      <div className="scenario-metric-grid">
        <ScenarioMetric
          label="Baseline 90-day cash"
          value={formatCurrency(baseline.projectedMaxCash, currency)}
          detail={`${baseline.commitmentCount} saved plan item${baseline.commitmentCount === 1 ? '' : 's'}`}
        />
        <ScenarioMetric
          label="Scenario 90-day cash"
          value={formatSignedCurrency(scenario.projectedMaxCash, currency)}
          detail={scenario.fundingGap > 0 ? `${formatCurrency(scenario.fundingGap, currency)} gap` : 'No cash gap projected'}
          tone={scenarioTone}
        />
        <ScenarioMetric
          label="Scenario movement"
          value={`${deltas.projectedMaxCash >= 0 ? '+' : '-'}${formatCurrency(Math.abs(deltas.projectedMaxCash), currency)}`}
          detail="Versus saved plan"
          tone={deltaTone}
        />
      </div>

      <div className="scenario-footnote">
        <CalendarClock size={16} />
        <span>
          Current monthly capacity is {formatSignedCurrency(monthlySummary.surplus, currency)} before scenario adjustments.
        </span>
      </div>
    </section>
  );
}
