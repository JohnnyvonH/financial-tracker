import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ListChecks,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import {
  getCommitmentProjection,
  getFinanceInsights,
  getGoalSummary,
  getRecurringMonthlySummary,
  getSnapshotTotals,
  getUpcomingPlanningItems,
} from '../utils/financeSummary';

const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  const [year, month, day] = String(dateString).split('-').map(Number);
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
};

const getDaysOld = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = String(dateString).split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.floor((today - date) / (24 * 60 * 60 * 1000));
};

function InsightIcon({ tone }) {
  if (tone === 'positive') return <CheckCircle2 size={18} />;
  if (tone === 'warning') return <AlertTriangle size={18} />;
  if (tone === 'danger') return <TrendingDown size={18} />;
  return <ListChecks size={18} />;
}

function FlowMetric({ label, value, detail, tone = 'neutral' }) {
  return (
    <article className={`flow-metric flow-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </article>
  );
}

function ActionCard({ icon: Icon, title, detail, onClick, primary = false }) {
  return (
    <button
      type="button"
      className={`dashboard-action-card${primary ? ' dashboard-action-card-primary' : ''}`}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{title}</span>
      <small>{detail}</small>
      <ArrowRight size={15} />
    </button>
  );
}

function SetupHealthPanel({ checks, onNavigate }) {
  return (
    <section className="panel setup-health-panel" aria-label="Setup health">
      <div className="dashboard-section-header">
        <div>
          <h2>Setup health</h2>
          <p>Forecast quality checks based on the data currently saved.</p>
        </div>
        <ListChecks size={20} />
      </div>
      <div className="setup-health-list">
        {checks.map((check) => (
          <article key={check.label} className={`setup-health-row setup-health-${check.tone}`}>
            <div className="setup-health-icon">
              {check.tone === 'positive' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
            </div>
            <div>
              <h3>{check.label}</h3>
              <p>{check.detail}</p>
            </div>
            <button type="button" className="text-action" onClick={() => onNavigate(check.view)}>
              {check.action}
              <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard({
  data,
  currency,
  onNavigate,
}) {
  const latestSnapshot = data.netWorthSnapshots[0];
  const snapshotTotals = getSnapshotTotals(latestSnapshot);
  const goalSummary = getGoalSummary(data.goals);
  const monthlySummary = getRecurringMonthlySummary(data.recurringTransactions, latestSnapshot);
  const commitmentItems = data.planningItems.filter((item) => item.type !== 'saving');
  const commitmentProjection = getCommitmentProjection(commitmentItems, snapshotTotals, 90);
  const cashRunway = monthlySummary.outgoings > 0
    ? snapshotTotals.maxAvailableCash / monthlySummary.outgoings
    : null;
  const insights = getFinanceInsights({
    balance: snapshotTotals.maxAvailableCash,
    monthlyIncome: monthlySummary.income,
    monthlyExpenses: monthlySummary.outgoings,
    planningItems: commitmentItems,
    goals: data.goals,
    netWorthSnapshots: data.netWorthSnapshots,
  });
  const upcomingPlan = getUpcomingPlanningItems(commitmentItems, 3);
  const hasIncomeSource = monthlySummary.recurringIncome > 0 || monthlySummary.snapshotPaycheck > 0;
  const latestSnapshotDate = latestSnapshot?.date ? formatDate(latestSnapshot.date) : 'No snapshot yet';
  const latestSnapshotAge = getDaysOld(latestSnapshot?.date);
  const projectedTone = commitmentProjection.projectedMaxCash >= 0 ? 'positive' : 'warning';
  const surplusTone = monthlySummary.surplus >= 0 ? 'positive' : 'danger';
  const runwayLabel = cashRunway !== null ? `${cashRunway.toFixed(1)} months` : 'Unknown';
  const savingsProgress = goalSummary.target > 0 ? `${goalSummary.progress.toFixed(0)}%` : 'No goals';
  const healthChecks = [
    latestSnapshot
      ? {
          label: 'Current finances',
          detail: latestSnapshotAge !== null && latestSnapshotAge > 21
            ? `Latest snapshot is ${latestSnapshotAge} days old.`
            : `Snapshot saved for ${latestSnapshotDate}.`,
          tone: latestSnapshotAge !== null && latestSnapshotAge > 21 ? 'warning' : 'positive',
          action: 'Update',
          view: 'snapshot',
        }
      : {
          label: 'Current finances',
          detail: 'Add a snapshot before relying on forecasts.',
          tone: 'warning',
          action: 'Add snapshot',
          view: 'snapshot',
        },
    hasIncomeSource
      ? {
          label: 'Monthly income',
          detail: 'Income source is available for capacity calculations.',
          tone: 'positive',
          action: 'Review',
          view: 'recurring',
        }
      : {
          label: 'Monthly income',
          detail: 'Add salary or regular income to calculate capacity.',
          tone: 'warning',
          action: 'Add income',
          view: 'recurring',
        },
    monthlySummary.outgoings > 0
      ? {
          label: 'Known outgoings',
          detail: 'Recurring bills and commitments are included.',
          tone: 'positive',
          action: 'Review',
          view: 'budget',
        }
      : {
          label: 'Known outgoings',
          detail: 'Add regular bills or transfers for a useful monthly budget.',
          tone: 'warning',
          action: 'Add outgoings',
          view: 'recurring',
        },
    data.goals.length > 0
      ? {
          label: 'Savings goals',
          detail: `${data.goals.length} goal${data.goals.length === 1 ? '' : 's'} tracked.`,
          tone: 'positive',
          action: 'Review',
          view: 'goals',
        }
      : {
          label: 'Savings goals',
          detail: 'Add goals to make surplus decisions easier.',
          tone: 'warning',
          action: 'Add goals',
          view: 'goals',
        },
    data.planningItems.length > 0
      ? {
          label: 'Plan items',
          detail: `${data.planningItems.length} plan item${data.planningItems.length === 1 ? '' : 's'} tracked.`,
          tone: 'positive',
          action: 'Review',
          view: 'plan',
        }
      : {
          label: 'Plan items',
          detail: 'Add upcoming costs or asset sales to improve projections.',
          tone: 'warning',
          action: 'Add plan',
          view: 'plan',
        },
  ];

  return (
    <div className="dashboard-home">
      <section className="dashboard-focus-panel">
        <div className="focus-copy">
          <span className={`focus-status focus-status-${projectedTone}`}>
            {projectedTone === 'positive' ? 'On track' : 'Needs review'}
          </span>
          <h1>Today&apos;s money picture</h1>
          <p>
            See usable cash, monthly breathing room, upcoming commitments, and the next action worth taking.
          </p>
        </div>

        <div className="focus-balance">
          <span>Max cash now</span>
          <strong>{formatCurrency(snapshotTotals.maxAvailableCash, currency)}</strong>
          <p>Latest snapshot: {latestSnapshotDate}</p>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('snapshot')}>
            <WalletCards size={16} />
            Update current finances
          </button>
        </div>
      </section>

      <section className="flow-summary" aria-label="Monthly finance summary">
        <FlowMetric
          label="Monthly income"
          value={hasIncomeSource ? formatCurrency(monthlySummary.income, currency) : 'Missing'}
          detail={hasIncomeSource ? 'Recurring income or paycheck snapshot' : 'Add salary or regular income'}
          tone={hasIncomeSource ? 'positive' : 'warning'}
        />
        <FlowMetric
          label="Known outgoings"
          value={formatCurrency(monthlySummary.outgoings, currency)}
          detail="Bills, subscriptions, and monthly transfers"
          tone="info"
        />
        <FlowMetric
          label="Monthly capacity"
          value={hasIncomeSource ? `${monthlySummary.surplus >= 0 ? '+' : '-'}${formatCurrency(Math.abs(monthlySummary.surplus), currency)}` : 'Unknown'}
          detail="Income minus known outgoings"
          tone={surplusTone}
        />
        <FlowMetric
          label="90-day projection"
          value={formatCurrency(commitmentProjection.projectedMaxCash, currency)}
          detail={`${commitmentProjection.commitmentCount} planned item${commitmentProjection.commitmentCount === 1 ? '' : 's'}`}
          tone={projectedTone}
        />
      </section>

      <section className="dashboard-decision-grid">
        <section className="panel panel-priority">
          <div className="dashboard-section-header">
            <h2>Needs attention</h2>
          </div>
          <div className="insight-feed">
            {insights.slice(0, 3).map((insight) => (
              <article key={insight.title} className={`insight-row insight-${insight.tone}`}>
                <div className="insight-row-icon"><InsightIcon tone={insight.tone} /></div>
                <div>
                  <h3>{insight.title}</h3>
                  <p>{insight.message}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel dashboard-next-panel">
          <div className="dashboard-section-header">
            <h2>Next commitments</h2>
            <button type="button" className="text-action" onClick={() => onNavigate('plan')}>
              Manage plan
              <ArrowRight size={15} />
            </button>
          </div>
          {upcomingPlan.length === 0 ? (
            <p className="empty-inline">No dated upcoming costs or asset sales yet.</p>
          ) : (
            <div className="compact-commitment-list">
              {upcomingPlan.map((item) => (
                <article key={item.id} className="compact-commitment-row">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{formatDate(item.dueDate)}</span>
                  </div>
                  <b>
                    {item.type === 'asset-sale'
                      ? formatCurrency(Number(item.expectedValue || item.targetAmount || 0), currency)
                      : formatCurrency(Number(item.targetAmount || 0), currency)}
                  </b>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="dashboard-health-strip">
        <article>
          <CircleDollarSign size={18} />
          <span>Cash runway</span>
          <strong>{runwayLabel}</strong>
        </article>
        <article>
          <PiggyBank size={18} />
          <span>Available assets</span>
          <strong>{formatCurrency(snapshotTotals.availableAssets, currency)}</strong>
        </article>
        <article>
          <Target size={18} />
          <span>Goal progress</span>
          <strong>{savingsProgress}</strong>
        </article>
      </section>

      <SetupHealthPanel checks={healthChecks} onNavigate={onNavigate} />

      <section className="dashboard-actions-panel">
        <div>
          <h2>Where to go next</h2>
          <p>Use the dashboard to decide, then jump into the page that owns the detail.</p>
        </div>
        <div className="dashboard-action-grid">
          <ActionCard
            icon={WalletCards}
            title="Current finances"
            detail="Update cash, cards, savings, pension"
            onClick={() => onNavigate('snapshot')}
            primary
          />
          <ActionCard
            icon={CalendarClock}
            title="Recurring payments"
            detail="Edit salary, bills, subscriptions"
            onClick={() => onNavigate('recurring')}
          />
          <ActionCard
            icon={PiggyBank}
            title="Plan"
            detail="Track commitments and asset sales"
            onClick={() => onNavigate('plan')}
          />
          <ActionCard
            icon={TrendingUp}
            title="Goals"
            detail="Check savings target progress"
            onClick={() => onNavigate('goals')}
          />
        </div>
      </section>
    </div>
  );
}
