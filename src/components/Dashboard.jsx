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
  getFinanceInsights,
  getGoalSummary,
  getPlanSummary,
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
  monthlyIncome,
  monthlyExpenses,
  last30DaysIncome,
  last30DaysExpenses,
  currentMonthSpending,
  currency,
  onNavigate,
}) {
  const latestSnapshot = data.netWorthSnapshots[0];
  const snapshotTotals = getSnapshotTotals(latestSnapshot);
  const planSummary = getPlanSummary(data.planningItems);
  const goalSummary = getGoalSummary(data.goals);
  const fundingGap = Math.max(planSummary.upcomingCosts - planSummary.alreadySaved - planSummary.expectedIncome, 0);
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const cashRunway = monthlyExpenses > 0 ? data.balance / monthlyExpenses : null;
  const insights = getFinanceInsights({
    balance: data.balance,
    monthlyIncome,
    monthlyExpenses,
    planningItems: data.planningItems,
    goals: data.goals,
    netWorthSnapshots: data.netWorthSnapshots,
  });
  const topCategories = Object.entries(getCategorySpending(data.transactions, 30))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const upcomingPlan = getUpcomingPlanningItems(data.planningItems, 5);
  const recentTransactions = data.transactions.slice(0, 6);

  return (
    <div className="dashboard-cockpit">
      <section className="dashboard-hero">
        <div>
          <h1>Your financial position</h1>
          <p>
            See cash, commitments, savings progress, and the next actions that protect your goals.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onNavigate('add-transaction')}>Add transaction</button>
          <button className="btn" onClick={() => onNavigate('plan')}>Review plan</button>
        </div>
      </section>

      <section className="metric-grid">
        <MetricTile
          label="Current balance"
          value={formatCurrency(data.balance, currency)}
          detail={`${formatCurrency(last30DaysIncome, currency)} in / ${formatCurrency(last30DaysExpenses, currency)} out, last 30 days`}
          icon={CircleDollarSign}
          tone="positive"
        />
        <MetricTile
          label="Monthly surplus"
          value={`${monthlySurplus >= 0 ? '+' : '-'}${formatCurrency(Math.abs(monthlySurplus), currency)}`}
          detail={monthlyIncome > 0 ? `${Math.max((monthlySurplus / monthlyIncome) * 100, -999).toFixed(0)}% of income` : 'Add income to calculate rate'}
          icon={monthlySurplus >= 0 ? TrendingUp : TrendingDown}
          tone={monthlySurplus >= 0 ? 'positive' : 'danger'}
        />
        <MetricTile
          label="Cash runway"
          value={cashRunway ? `${cashRunway.toFixed(1)} months` : 'No spend yet'}
          detail="Based on this month’s expenses"
          icon={WalletCards}
          tone="info"
        />
        <MetricTile
          label="Plan funding gap"
          value={formatCurrency(fundingGap, currency)}
          detail={`${data.planningItems.length} plan item${data.planningItems.length === 1 ? '' : 's'} tracked`}
          icon={CalendarClock}
          tone={fundingGap > 0 ? 'warning' : 'positive'}
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
          <SectionHeader title="Savings and assets" action="Open plan" onAction={() => onNavigate('plan')} />
          <div className="asset-summary">
            <div>
              <span>Available assets</span>
              <strong>{formatCurrency(snapshotTotals.availableAssets, currency)}</strong>
            </div>
            <div>
              <span>All assets</span>
              <strong>{formatCurrency(snapshotTotals.allAssets, currency)}</strong>
            </div>
            <div>
              <span>Goal progress</span>
              <strong>{goalSummary.progress.toFixed(0)}%</strong>
            </div>
          </div>
          <div className="progress-bar progress-bar-large">
            <div className="progress-fill" style={{ width: `${goalSummary.progress}%` }} />
          </div>
          <p className="panel-note">
            {goalSummary.remaining > 0
              ? `${formatCurrency(goalSummary.remaining, currency)} remaining across savings goals.`
              : data.goals.length > 0
                ? 'All tracked goals are fully funded.'
                : 'Add a savings goal to track progress here.'}
          </p>
        </section>

        <section className="panel panel-wide">
          <SectionHeader title="Upcoming commitments" action="Manage plan" onAction={() => onNavigate('plan')} />
          {upcomingPlan.length === 0 ? (
            <p className="empty-inline">No upcoming costs, asset sales, or savings targets yet.</p>
          ) : (
            <div className="timeline-list">
              {upcomingPlan.map((item) => (
                <article className="timeline-row" key={item.id}>
                  <div className={`timeline-marker priority-${item.priority}`} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.type === 'asset-sale' ? 'Asset sale' : item.type === 'saving' ? 'Savings target' : 'Upcoming cost'}</p>
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

        <section className="panel">
          <SectionHeader title="Spending focus" action="Open budgets" onAction={() => onNavigate('budget')} />
          {topCategories.length === 0 ? (
            <p className="empty-inline">No expense categories in the last 30 days.</p>
          ) : (
            <div className="category-table">
              {topCategories.map(([category, amount]) => {
                const categoryInfo = getCategoryIcon(category);
                const CategoryIcon = categoryInfo.icon;
                const percentage = last30DaysExpenses > 0 ? (amount / last30DaysExpenses) * 100 : 0;
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

        <section className="panel">
          <SectionHeader title="Recent ledger" action="View all" onAction={() => onNavigate('transactions')} />
          {recentTransactions.length === 0 ? (
            <p className="empty-inline">No transactions yet.</p>
          ) : (
            <div className="ledger-list">
              {recentTransactions.map((transaction) => (
                <article className="ledger-row" key={transaction.id}>
                  <div>
                    <strong>{transaction.description || transaction.category}</strong>
                    <span>{formatDate(transaction.date)} · {transaction.category}</span>
                  </div>
                  <strong className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel panel-action">
          <Landmark size={22} />
          <h2>Build the next version of your plan</h2>
          <p>Keep the dashboard useful by adding payday estimates, high-priority costs, asset sale values, and house deposit milestones.</p>
          <div className="action-grid">
            <button className="btn btn-primary" onClick={() => onNavigate('add-goal')}><Target size={16} />Add goal</button>
            <button className="btn" onClick={() => onNavigate('plan')}><PiggyBank size={16} />Add plan</button>
          </div>
        </section>
      </div>
    </div>
  );
}
