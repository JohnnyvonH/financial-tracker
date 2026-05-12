import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Landmark,
  ListChecks,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import {
  getCategorySpending,
  getCommitmentProjection,
  getFinanceInsights,
  getGoalSummary,
  getRecurringMonthlySummary,
  getSnapshotTotals,
  getUpcomingPlanningItems,
} from '../utils/financeSummary';
import { getCategoryIcon } from '../utils/categories';

const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
};

function InsightIcon({ tone }) {
  if (tone === 'positive') return <CheckCircle2 size={18} />;
  if (tone === 'warning') return <AlertTriangle size={18} />;
  if (tone === 'danger') return <TrendingDown size={18} />;
  return <ListChecks size={18} />;
}

function MetricTile({ label, value, detail, icon: Icon, tone = 'neutral' }) {
  return (
    <article className={`metric-tile metric-tile-${tone}`}>
      <div className="metric-tile-icon">
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <p>{detail}</p>}
      </div>
    </article>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="dashboard-section-header">
      <h2>{title}</h2>
      {action && (
        <button type="button" className="text-action" onClick={onAction}>
          {action}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
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
  const fundingGap = Math.max(commitmentProjection.costs - commitmentProjection.assetSales, 0);
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
  const recurringOutgoings = Object.entries(monthlySummary.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const topCategories = Object.entries(getCategorySpending(data.transactions, 30))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  const upcomingPlan = getUpcomingPlanningItems(commitmentItems, 5);
  const visibleGoals = [...data.goals]
    .sort((a, b) => {
      const aRemaining = Math.max(Number(a.target || 0) - Number(a.current || 0), 0);
      const bRemaining = Math.max(Number(b.target || 0) - Number(b.current || 0), 0);
      return bRemaining - aRemaining;
    })
    .slice(0, 4);

  return (
    <div className="dashboard-cockpit">
      <section className="dashboard-hero">
        <div>
          <h1>Your financial position</h1>
          <p>
            See current cash, monthly outgoings, savings progress, and how upcoming commitments change your runway.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onNavigate('snapshot')}>Update current finances</button>
          <button className="btn" onClick={() => onNavigate('plan')}>Review commitments</button>
        </div>
      </section>

      <section className="metric-grid">
        <MetricTile
          label="Max cash now"
          value={formatCurrency(snapshotTotals.maxAvailableCash, currency)}
          detail="Snapshot cash after cards and MoneyBox monthly"
          icon={CircleDollarSign}
          tone="positive"
        />
        <MetricTile
          label="Monthly savings capacity"
          value={`${monthlySummary.surplus >= 0 ? '+' : '-'}${formatCurrency(Math.abs(monthlySummary.surplus), currency)}`}
          detail={`${formatCurrency(monthlySummary.income, currency)} income / ${formatCurrency(monthlySummary.outgoings, currency)} outgoings`}
          icon={monthlySummary.surplus >= 0 ? TrendingUp : TrendingDown}
          tone={monthlySummary.surplus >= 0 ? 'positive' : 'danger'}
        />
        <MetricTile
          label="Monthly outgoings"
          value={formatCurrency(monthlySummary.outgoings, currency)}
          detail={`${formatCurrency(monthlySummary.moneyboxMonthly, currency)} MoneyBox monthly included`}
          icon={WalletCards}
          tone="info"
        />
        <MetricTile
          label="Projected max cash"
          value={formatCurrency(commitmentProjection.projectedMaxCash, currency)}
          detail={`Next ${commitmentProjection.horizonDays} days after commitments`}
          icon={CalendarClock}
          tone={commitmentProjection.projectedMaxCash >= 0 ? 'positive' : 'warning'}
        />
      </section>

      <section className="metric-grid metric-grid-secondary">
        <MetricTile
          label="Cash runway"
          value={cashRunway !== null ? `${cashRunway.toFixed(1)} months` : 'No spend yet'}
          detail="Based on monthly outgoings"
          icon={WalletCards}
          tone="info"
        />
        <MetricTile
          label="Commitment gap"
          value={formatCurrency(fundingGap, currency)}
          detail={`${formatCurrency(commitmentProjection.costs, currency)} costs / ${formatCurrency(commitmentProjection.assetSales, currency)} sales`}
          icon={CalendarClock}
          tone={fundingGap > 0 ? 'warning' : 'positive'}
        />
        <MetricTile
          label="Available assets"
          value={formatCurrency(snapshotTotals.availableAssets, currency)}
          detail="Excludes pension and normal LISA access"
          icon={PiggyBank}
          tone="positive"
        />
        <MetricTile
          label="House deposit access"
          value={formatCurrency(snapshotTotals.houseDepositAccessibleAssets, currency)}
          detail="Available assets plus Lifetime ISA"
          icon={Target}
          tone="positive"
        />
      </section>

      <div className="dashboard-layout">
        <section className="panel panel-priority">
          <SectionHeader title="What needs attention" />
          <div className="insight-feed">
            {insights.map((insight) => (
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

        <section className="panel">
          <SectionHeader title="Current finances" action="Open current finances" onAction={() => onNavigate('snapshot')} />
          <div className="asset-summary">
            <div>
              <span>Max cash</span>
              <strong>{formatCurrency(snapshotTotals.maxAvailableCash, currency)}</strong>
            </div>
            <div>
              <span>Available assets</span>
              <strong>{formatCurrency(snapshotTotals.availableAssets, currency)}</strong>
            </div>
            <div>
              <span>All wealth</span>
              <strong>{formatCurrency(snapshotTotals.allAssets, currency)}</strong>
            </div>
          </div>
          <div className="progress-bar progress-bar-large">
            <div className="progress-fill" style={{ width: `${goalSummary.progress}%` }} />
          </div>
          <p className="panel-note">
            Lifetime ISA is counted separately for house-deposit access. Pension is included only in all wealth.
          </p>
        </section>

        <section className="panel">
          <SectionHeader title="Monthly outgoings" action="Manage recurring" onAction={() => onNavigate('add-recurring')} />
          {recurringOutgoings.length === 0 ? (
            <p className="empty-inline">Add recurring income and outgoings to see your paycheck impact.</p>
          ) : (
            <div className="category-table">
              {recurringOutgoings.map(([category, amount]) => {
                const categoryInfo = getCategoryIcon(category);
                const CategoryIcon = categoryInfo.icon;
                const percentage = monthlySummary.outgoings > 0 ? (amount / monthlySummary.outgoings) * 100 : 0;
                return (
                  <article key={category} className="category-row">
                    <span className="category-icon" style={{ color: categoryInfo.color }}>
                      <CategoryIcon size={17} />
                    </span>
                    <div>
                      <strong>{category}</strong>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percentage}%`, background: categoryInfo.color }} />
                      </div>
                    </div>
                    <span>{formatCurrency(amount, currency)}</span>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel panel-wide">
          <SectionHeader title="Commitments timeline" action="Manage plan" onAction={() => onNavigate('plan')} />
          {upcomingPlan.length === 0 ? (
            <p className="empty-inline">No dated upcoming costs or asset sales yet.</p>
          ) : (
            <div className="timeline-list">
              {upcomingPlan.map((item) => (
                <article className="timeline-row" key={item.id}>
                  <div className={`timeline-marker priority-${item.priority}`} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.type === 'asset-sale' ? 'Asset sale' : 'Upcoming cost'}</p>
                  </div>
                  <span>{formatDate(item.dueDate)}</span>
                  <strong>
                    {item.type === 'asset-sale'
                      ? formatCurrency(Number(item.expectedValue || 0), currency)
                      : formatCurrency(Number(item.targetAmount || 0), currency)}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel panel-wide">
          <SectionHeader title="Savings goals" action="Manage goals" onAction={() => onNavigate('goals')} />
          {visibleGoals.length === 0 ? (
            <div className="goal-preview-empty">
              <Target size={22} />
              <p>Add goals for your house deposit, emergency fund, car plans, or any savings target you want visible here.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('add-goal')}>Add goal</button>
            </div>
          ) : (
            <div className="goal-preview-grid">
              {visibleGoals.map((goal) => {
                const target = Number(goal.target || 0);
                const current = Number(goal.current || 0);
                const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
                return (
                  <article className="goal-preview-card" key={goal.id}>
                    <div>
                      <h3>{goal.name}</h3>
                      <span>{formatCurrency(Math.max(target - current, 0), currency)} remaining</span>
                    </div>
                    <strong>{progress.toFixed(0)}%</strong>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p>{formatCurrency(current, currency)} saved of {formatCurrency(target, currency)}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel">
          <SectionHeader title="Optional transaction view" action="Open transactions" onAction={() => onNavigate('transactions')} />
          {topCategories.length === 0 ? (
            <p className="empty-inline">Transactions are optional detail for ad-hoc spending.</p>
          ) : (
            <div className="category-table">
              {topCategories.map(([category, amount]) => {
                const categoryInfo = getCategoryIcon(category);
                const CategoryIcon = categoryInfo.icon;
                const percentage = amount > 0 ? 100 : 0;
                return (
                  <article key={category} className="category-row">
                    <span className="category-icon" style={{ color: categoryInfo.color }}>
                      <CategoryIcon size={17} />
                    </span>
                    <div>
                      <strong>{category}</strong>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percentage}%`, background: categoryInfo.color }} />
                      </div>
                    </div>
                    <span>{formatCurrency(amount, currency)}</span>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel panel-action">
          <Landmark size={22} />
          <h2>Shape the next month</h2>
          <p>Keep the forecast useful by updating your current finances, monthly outgoings, commitments, and goals.</p>
          <div className="action-grid">
            <button className="btn btn-primary" onClick={() => onNavigate('snapshot')}><WalletCards size={16} />Update finances</button>
            <button className="btn" onClick={() => onNavigate('add-recurring')}><CalendarClock size={16} />Add outgoing</button>
            <button className="btn" onClick={() => onNavigate('plan')}><PiggyBank size={16} />Add commitment</button>
          </div>
        </section>
      </div>
    </div>
  );
}
