import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
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
  const topCategories = Object.entries(monthlySummary.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const widestCategoryAmount = Math.max(...topCategories.map(([, amount]) => amount), 1);
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

  return (
    <div className="recurring-workspace monthly-budget-page">
      <section className="dashboard-hero recurring-hero">
        <div>
          <h1>Monthly budget</h1>
          <p>
            Build the month from dependable income and known outgoings, then use the remaining capacity for goals and planned commitments.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate?.('recurring')}>
            <Plus size={17} />
            Add monthly item
          </button>
        </div>
      </section>

      <section className="metric-grid recurring-summary-grid">
        <BudgetMetric
          label="Monthly income"
          value={hasIncomeSource ? formatCurrency(monthlySummary.income, currency) : 'Missing'}
          detail={hasIncomeSource ? 'Recurring income or latest paycheck snapshot' : 'Add salary or regular income'}
          icon={TrendingUp}
          tone={hasIncomeSource ? 'positive' : 'warning'}
        />
        <BudgetMetric
          label="Known outgoings"
          value={formatCurrency(monthlySummary.outgoings, currency)}
          detail="Bills, subscriptions, transfers, and commitments"
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

      <section className="dashboard-decision-grid">
        <section className="panel panel-wide">
          <div className="dashboard-section-header">
            <h2>Monthly outgoings by category</h2>
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
            <h2>Monthly health</h2>
          </div>
          <div className="insight-feed">
            <article className={`insight-row insight-${hasIncomeSource ? surplusTone : 'warning'}`}>
              <div className="insight-row-icon">
                {hasIncomeSource && monthlySummary.surplus >= 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div>
                <h3>{hasIncomeSource && monthlySummary.surplus >= 0 ? 'Capacity available' : 'Budget needs attention'}</h3>
                <p>
                  {hasIncomeSource
                    ? `${formatCurrency(Math.abs(monthlySummary.surplus), currency)} ${monthlySummary.surplus >= 0 ? 'remains after known outgoings.' : 'shortfall against known outgoings.'}`
                    : 'Add recurring income so monthly capacity can be calculated.'}
                </p>
              </div>
            </article>
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

      <section className="grid grid-2 gap-6">
        <section className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Income rhythm</h3>
          {incomeItems.length === 0 ? (
            <p className="empty-inline">No active recurring income yet.</p>
          ) : (
            <div className="compact-commitment-list">
              {incomeItems.map((item) => (
                <article key={item.id} className="compact-commitment-row">
                  <div>
                    <strong>{item.description}</strong>
                    <span>{item.category}</span>
                  </div>
                  <b>{formatMonthlyAmount(item, currency)}</b>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Largest outgoings</h3>
          {outgoingItems.length === 0 ? (
            <p className="empty-inline">No active recurring outgoings yet.</p>
          ) : (
            <div className="compact-commitment-list">
              {[...outgoingItems]
                .sort((a, b) => getMonthlyEquivalent(b.amount, b.frequency) - getMonthlyEquivalent(a.amount, a.frequency))
                .slice(0, 8)
                .map((item) => (
                  <article key={item.id} className="compact-commitment-row">
                    <div>
                      <strong>{item.description}</strong>
                      <span>{item.category}</span>
                    </div>
                    <b>{formatMonthlyAmount(item, currency)}</b>
                  </article>
                ))}
            </div>
          )}
        </section>
      </section>

      {categoryLimitRows.length > 0 && (
        <section className="panel">
          <div className="dashboard-section-header">
            <h2>Existing category limits</h2>
          </div>
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
        </section>
      )}
    </div>
  );
}
