import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  Plus,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getMonthlyEquivalent, getRecurringMonthlySummary } from '../utils/financeSummary';

const isActiveRecurring = (item) => item.active !== false && item.is_active !== false;

function BudgetMetric({ label, value, detail, icon: Icon, tone = 'info' }) {
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

function formatMonthlyAmount(item, currency) {
  const monthlyAmount = getMonthlyEquivalent(item.amount, item.frequency);
  return formatCurrency(monthlyAmount, currency);
}

function FlowStep({ label, value, detail, tone = 'neutral' }) {
  return (
    <article className={`budget-flow-step budget-flow-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default function Budget({
  recurringTransactions = [],
  latestSnapshot,
  budgets = {},
  currency = 'USD',
  onNavigate,
}) {
  const monthlySummary = useMemo(
    () => getRecurringMonthlySummary(recurringTransactions, latestSnapshot),
    [recurringTransactions, latestSnapshot]
  );

  const activeItems = useMemo(
    () => recurringTransactions.filter(isActiveRecurring),
    [recurringTransactions]
  );

  const incomeItems = activeItems.filter((item) => item.type === 'income');
  const outgoingItems = activeItems.filter((item) => item.type !== 'income');
  const hasIncomeSource = monthlySummary.recurringIncome > 0 || monthlySummary.snapshotPaycheck > 0;
  const surplusTone = monthlySummary.surplus >= 0 ? 'positive' : 'danger';
  const recurringExpenseTotal = monthlySummary.recurringExpenses;
  const snapshotCommitmentTotal = monthlySummary.moneyboxMonthly;
  const topCategories = Object.entries(monthlySummary.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const widestCategoryAmount = Math.max(...topCategories.map(([, amount]) => amount), 1);
  const categoryTotal = Math.max(monthlySummary.outgoings, 1);
  const categoryLimitRows = Object.entries(budgets)
    .map(([category, limit]) => {
      const committed = monthlySummary.byCategory[category] || 0;
      return {
        category,
        limit: Number(limit || 0),
        committed,
        remaining: Number(limit || 0) - committed,
      };
    })
    .sort((a, b) => b.committed - a.committed);

  const sortedIncomeItems = [...incomeItems].sort(
    (a, b) => getMonthlyEquivalent(b.amount, b.frequency) - getMonthlyEquivalent(a.amount, a.frequency)
  );
  const sortedOutgoingItems = [...outgoingItems].sort(
    (a, b) => getMonthlyEquivalent(b.amount, b.frequency) - getMonthlyEquivalent(a.amount, a.frequency)
  );

  return (
    <div className="recurring-workspace monthly-budget-page">
      <section className="dashboard-hero recurring-hero">
        <div>
          <h1>Monthly budget planner</h1>
          <p>
            See the dependable money coming in, the commitments already spoken for, and the capacity left for goals and planned costs.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate?.('recurring')}>
            <Plus size={17} />
            Add income or outgoing
          </button>
        </div>
      </section>

      <div className="budget-page-intro">
        <span>Month at a glance</span>
        <p>Use this page as the calmer monthly version of your money: regular income, known outgoings, and the space left to plan.</p>
      </div>

      <section className="metric-grid recurring-summary-grid">
        <BudgetMetric
          label="Monthly income"
          value={hasIncomeSource ? formatCurrency(monthlySummary.income, currency) : 'Missing'}
          detail={hasIncomeSource ? 'Salary, benefits, or latest paycheck snapshot' : 'Add salary or regular income'}
          icon={TrendingUp}
          tone={hasIncomeSource ? 'positive' : 'warning'}
        />
        <BudgetMetric
          label="Known outgoings"
          value={formatCurrency(monthlySummary.outgoings, currency)}
          detail="Bills, subscriptions, transfers, and known commitments"
          icon={TrendingDown}
          tone={monthlySummary.outgoings > monthlySummary.income ? 'warning' : 'info'}
        />
        <BudgetMetric
          label="Monthly capacity"
          value={hasIncomeSource ? `${monthlySummary.surplus >= 0 ? '+' : '-'}${formatCurrency(Math.abs(monthlySummary.surplus), currency)}` : 'Unknown'}
          detail="Income minus known outgoings"
          icon={WalletCards}
          tone={hasIncomeSource ? surplusTone : 'warning'}
        />
        <BudgetMetric
          label="Active items"
          value={`${activeItems.length} tracked`}
          detail={`${incomeItems.length} income, ${outgoingItems.length} outgoing`}
          icon={CalendarClock}
          tone="info"
        />
      </section>

      <section className="budget-flow-panel panel">
        <div className="dashboard-section-header">
          <div>
            <h2>Monthly flow</h2>
            <p>How your available budget is calculated before one-off plans and goals.</p>
          </div>
          <button type="button" className="text-action" onClick={() => onNavigate?.('recurring')}>
            Adjust regular items
            <ArrowRight size={15} />
          </button>
        </div>
        <div
          className={`budget-flow-grid ${snapshotCommitmentTotal > 0 ? 'budget-flow-grid-detailed' : 'budget-flow-grid-simple'}`}
          aria-label="Monthly budget calculation"
        >
          <FlowStep
            label="Money in"
            value={hasIncomeSource ? formatCurrency(monthlySummary.income, currency) : 'Missing'}
            detail="Recurring income plus the latest paycheck snapshot when present."
            tone={hasIncomeSource ? 'positive' : 'warning'}
          />
          <div className="budget-flow-operator">-</div>
          <FlowStep
            label="Recurring outgoings"
            value={formatCurrency(recurringExpenseTotal, currency)}
            detail="Regular payments you expect each month."
            tone="info"
          />
          {snapshotCommitmentTotal > 0 && (
            <>
              <div className="budget-flow-operator">-</div>
              <FlowStep
                label="Current-finance commitments"
                value={formatCurrency(snapshotCommitmentTotal, currency)}
                detail="Saved commitments from the latest current-finance snapshot."
                tone="info"
              />
            </>
          )}
          <div className="budget-flow-operator">=</div>
          <FlowStep
            label="Capacity left"
            value={hasIncomeSource ? `${monthlySummary.surplus >= 0 ? '+' : '-'}${formatCurrency(Math.abs(monthlySummary.surplus), currency)}` : 'Unknown'}
            detail={monthlySummary.surplus >= 0 ? 'Available for goals, plans, and buffers.' : 'Outgoings are higher than dependable income.'}
            tone={hasIncomeSource ? surplusTone : 'warning'}
          />
        </div>
      </section>

      <section className="budget-decision-grid">
        <section className="panel panel-wide">
          <div className="dashboard-section-header">
            <div>
              <h2>Outgoing categories</h2>
              <p>Where the known monthly budget is going.</p>
            </div>
            <button type="button" className="text-action" onClick={() => onNavigate?.('recurring')}>
              Manage recurring
              <ArrowRight size={15} />
            </button>
          </div>
          {topCategories.length === 0 ? (
            <p className="empty-inline">No recurring outgoings yet.</p>
          ) : (
            <div className="monthly-category-list">
              {topCategories.map(([category, amount]) => (
                <article key={category} className="monthly-category-row">
                  <div>
                    <strong>{category}</strong>
                    <span>{formatCurrency(amount, currency)} per month</span>
                  </div>
                  <small>{Math.round((amount / categoryTotal) * 100)}% of known outgoings</small>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.max((amount / widestCategoryAmount) * 100, 8)}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel dashboard-next-panel">
          <div className="dashboard-section-header">
            <div>
              <h2>Next best action</h2>
              <p>A simple prompt based on the current monthly setup.</p>
            </div>
          </div>
          <div className="insight-feed">
            <article className={`insight-row insight-${hasIncomeSource ? surplusTone : 'warning'}`}>
              <div className="insight-row-icon">
                {hasIncomeSource && monthlySummary.surplus >= 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div>
                <h3>{hasIncomeSource && monthlySummary.surplus >= 0 ? 'Set the plan from capacity' : 'Budget needs attention'}</h3>
                <p>
                  {hasIncomeSource
                    ? `${formatCurrency(Math.abs(monthlySummary.surplus), currency)} ${monthlySummary.surplus >= 0 ? 'remains after known outgoings. Use it for goals, planned costs, or a buffer.' : 'shortfall against known outgoings. Review the largest outgoing rows first.'}`
                    : 'Add recurring income so monthly capacity can be calculated.'}
                </p>
              </div>
            </article>
            {categoryLimitRows.length === 0 && (
              <article className="insight-row insight-info">
                <div className="insight-row-icon"><ListChecks size={18} /></div>
                <div>
                  <h3>No category limits yet</h3>
                  <p>Add limits when you want this page to show how much room is left inside each monthly category.</p>
                </div>
              </article>
            )}
            {monthlySummary.moneyboxMonthly > 0 && (
              <article className="insight-row insight-info">
                <div className="insight-row-icon"><WalletCards size={18} /></div>
                <div>
                  <h3>Snapshot commitment included</h3>
                  <p>{formatCurrency(monthlySummary.moneyboxMonthly, currency)} from current finances is counted in known outgoings.</p>
                </div>
              </article>
            )}
          </div>
        </section>
      </section>

      <section className="panel">
        <div className="dashboard-section-header">
          <div>
            <h2>Monthly recurring items</h2>
            <p>All regular money in and out, ordered so the full budget is easier to scan.</p>
          </div>
          <button type="button" className="text-action" onClick={() => onNavigate?.('recurring')}>
            Edit items
            <ArrowRight size={15} />
          </button>
        </div>
        {activeItems.length === 0 ? (
          <p className="empty-inline">No active recurring items yet.</p>
        ) : (
          <div className="budget-item-table" role="table" aria-label="Monthly recurring items">
            <div className="budget-item-table-head" role="row">
              <span>Description</span>
              <span>Category</span>
              <span>Type</span>
              <span>Monthly</span>
            </div>
            {[...sortedIncomeItems, ...sortedOutgoingItems].map((item) => (
              <article key={item.id} className="budget-item-table-row" role="row">
                <strong>{item.description}</strong>
                <span>{item.category}</span>
                <span className={`budget-type-pill budget-type-${item.type === 'income' ? 'income' : 'outgoing'}`}>
                  {item.type === 'income' ? 'Income' : 'Outgoing'}
                </span>
                <b>{formatMonthlyAmount(item, currency)}</b>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="dashboard-section-header">
          <div>
            <h2>Category limits</h2>
            <p>Optional guardrails for monthly categories.</p>
          </div>
        </div>
        {categoryLimitRows.length > 0 ? (
          <div className="monthly-category-list">
            {categoryLimitRows.map((row) => {
              const percentage = row.limit > 0 ? Math.min((row.committed / row.limit) * 100, 100) : 0;
              return (
                <article key={row.category} className="monthly-category-row">
                  <div>
                    <strong>{row.category}</strong>
                    <span>
                      {formatCurrency(row.committed, currency)} committed of {formatCurrency(row.limit, currency)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${row.remaining < 0 ? 'bg-red-500' : ''}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <small className={row.remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                    {row.remaining < 0
                      ? `${formatCurrency(Math.abs(row.remaining), currency)} over limit`
                      : `${formatCurrency(row.remaining, currency)} left`}
                  </small>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="budget-empty-limits">
            <ListChecks size={22} />
            <div>
              <strong>No category limits have been set</strong>
              <p>Budgets still works from monthly income and recurring outgoings. Add category limits later if you want stricter spending guardrails.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
