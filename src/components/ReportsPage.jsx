import React, { useMemo } from 'react';
import {
  BarChart3,
  CalendarClock,
  Download,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { exportGoalsToCSV, exportMonthlyFlowToCSV, exportToCSV } from '../utils/export';
import NetWorthTrendChart from './NetWorthTrendChart';
import {
  getCommitmentProjection,
  getGoalSummary,
  getMonthlyEquivalent,
  getRecurringMonthlySummary,
  getSnapshotTotals,
} from '../utils/financeSummary';
import { getMonthlyTransactionComparison, getPlanningReportSummary } from '../utils/reporting';

const isActiveRecurring = (item) => item.active !== false && item.is_active !== false;

function ReportMetric({ label, value, detail, icon: Icon, tone = 'info' }) {
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

function DeltaValue({ value, currency, inverse = false }) {
  const isPositive = value >= 0;
  const positiveTone = inverse ? 'danger' : 'positive';
  const negativeTone = inverse ? 'positive' : 'danger';
  const tone = isPositive ? positiveTone : negativeTone;

  return (
    <strong className={`report-delta report-delta-${tone}`}>
      {isPositive ? '+' : '-'}{formatCurrency(Math.abs(value), currency)}
    </strong>
  );
}

export default function ReportsPage({
  transactions = [],
  goals = [],
  recurringTransactions = [],
  planningItems = [],
  netWorthSnapshots = [],
  latestSnapshot,
  currency = 'USD',
}) {
  const monthlySummary = useMemo(
    () => getRecurringMonthlySummary(recurringTransactions, latestSnapshot),
    [recurringTransactions, latestSnapshot]
  );
  const activeRecurring = recurringTransactions.filter(isActiveRecurring);
  const snapshotTotals = getSnapshotTotals(latestSnapshot);
  const goalSummary = getGoalSummary(goals);
  const planningSummary = getPlanningReportSummary(planningItems);
  const transactionComparison = getMonthlyTransactionComparison(transactions);
  const commitmentProjection = getCommitmentProjection(planningItems.filter((item) => item.type !== 'saving'), snapshotTotals, 90);
  const surplusTone = monthlySummary.surplus >= 0 ? 'positive' : 'danger';
  const topOutgoings = activeRecurring
    .filter((item) => item.type !== 'income')
    .map((item) => ({
      ...item,
      monthlyAmount: getMonthlyEquivalent(item.amount, item.frequency),
    }))
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
    .slice(0, 8);

  const recentTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return date >= start && date <= now;
  });

  const recentTransactionTotals = recentTransactions.reduce((summary, transaction) => {
    if (transaction.type === 'income') {
      summary.income += Number(transaction.amount || 0);
    } else {
      summary.expenses += Number(transaction.amount || 0);
    }

    return summary;
  }, { income: 0, expenses: 0 });

  const handleExport = (type) => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (type === 'monthly-flow') {
      return exportMonthlyFlowToCSV({
        recurringTransactions,
        latestSnapshot,
        monthlySummary,
      }, `monthly-flow-${timestamp}.csv`);
    }

    if (type === 'transactions') {
      return exportToCSV(recentTransactions, `current-month-transactions-${timestamp}.csv`);
    }

    if (type === 'goals') {
      return exportGoalsToCSV(goals, `goals-${timestamp}.csv`);
    }

    return false;
  };

  return (
    <div className="recurring-workspace monthly-report-page">
      <section className="card mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary" size={28} />
            <div>
              <h2 className="text-2xl font-light">Monthly reports</h2>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                Review the monthly income and outgoings that drive savings capacity.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => handleExport('monthly-flow')}
              className="btn btn-primary text-sm"
              disabled={activeRecurring.length === 0 && !latestSnapshot}
            >
              <Download size={16} />
              Export Monthly Flow CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('transactions')}
              className="btn text-sm"
              disabled={recentTransactions.length === 0}
            >
              <Download size={16} />
              Export Current Month CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('goals')}
              className="btn text-sm"
              disabled={goals.length === 0}
            >
              <Download size={16} />
              Export Goals CSV
            </button>
          </div>
        </div>
      </section>

      <section className="metric-grid recurring-summary-grid">
        <ReportMetric
          label="Monthly income"
          value={monthlySummary.income > 0 ? formatCurrency(monthlySummary.income, currency) : 'Missing'}
          detail={monthlySummary.recurringIncome > 0 ? 'From active recurring income' : 'Using latest snapshot if available'}
          icon={TrendingUp}
          tone={monthlySummary.income > 0 ? 'positive' : 'warning'}
        />
        <ReportMetric
          label="Known outgoings"
          value={formatCurrency(monthlySummary.outgoings, currency)}
          detail="Recurring outgoings plus snapshot commitments"
          icon={TrendingDown}
          tone="info"
        />
        <ReportMetric
          label="Monthly capacity"
          value={monthlySummary.income > 0 ? `${monthlySummary.surplus >= 0 ? '+' : '-'}${formatCurrency(Math.abs(monthlySummary.surplus), currency)}` : 'Unknown'}
          detail="Income minus known outgoings"
          icon={WalletCards}
          tone={monthlySummary.income > 0 ? surplusTone : 'warning'}
        />
        <ReportMetric
          label="90-day cash projection"
          value={formatCurrency(commitmentProjection.projectedMaxCash, currency)}
          detail={`${commitmentProjection.commitmentCount} planned item${commitmentProjection.commitmentCount === 1 ? '' : 's'}`}
          icon={CalendarClock}
          tone={commitmentProjection.projectedMaxCash >= 0 ? 'positive' : 'warning'}
        />
      </section>

      <section className="dashboard-decision-grid">
        <section className="panel panel-wide">
          <div className="dashboard-section-header">
            <h2>Largest monthly outgoings</h2>
          </div>
          {topOutgoings.length === 0 ? (
            <p className="empty-inline">No monthly outgoings to report yet.</p>
          ) : (
            <div className="compact-commitment-list">
              {topOutgoings.map((item) => (
                <article key={item.id} className="compact-commitment-row">
                  <div>
                    <strong>{item.description}</strong>
                    <span>{item.category}</span>
                  </div>
                  <b>{formatCurrency(item.monthlyAmount, currency)}</b>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel dashboard-next-panel">
          <div className="dashboard-section-header">
            <h2>Savings context</h2>
          </div>
          <div className="dashboard-health-strip report-health-strip">
            <article>
              <PiggyBank size={18} />
              <span>Available assets</span>
              <strong>{formatCurrency(snapshotTotals.availableAssets, currency)}</strong>
            </article>
            <article>
              <Target size={18} />
              <span>Goals saved</span>
              <strong>{formatCurrency(goalSummary.saved, currency)}</strong>
            </article>
            <article>
              <WalletCards size={18} />
              <span>Max cash now</span>
              <strong>{formatCurrency(snapshotTotals.maxAvailableCash, currency)}</strong>
            </article>
          </div>
        </section>
      </section>

      <NetWorthTrendChart snapshots={netWorthSnapshots} currency={currency} />

      <section className="grid grid-2 gap-6 report-analysis-grid">
        <section className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Planning exposure</h3>
          <div className="report-analysis-list">
            <article>
              <span>Upcoming costs after saved funds</span>
              <strong>{formatCurrency(planningSummary.upcomingCosts, currency)}</strong>
            </article>
            <article>
              <span>Expected asset sales</span>
              <strong>{formatCurrency(planningSummary.expectedAssetSales, currency)}</strong>
            </article>
            <article>
              <span>Open savings target gap</span>
              <strong>{formatCurrency(planningSummary.savingsTargets, currency)}</strong>
            </article>
            <article>
              <span>High priority items</span>
              <strong>{planningSummary.highPriority}</strong>
            </article>
          </div>
          <p className="report-analysis-note">
            {planningSummary.undated > 0
              ? `${planningSummary.undated} open item${planningSummary.undated === 1 ? '' : 's'} still need a date for projection accuracy.`
              : 'All open planning items are dated.'}
          </p>
        </section>

        <section className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Month-over-month check</h3>
          <div className="report-comparison-grid">
            <article>
              <span>Income change</span>
              <DeltaValue value={transactionComparison.deltas.income} currency={currency} />
            </article>
            <article>
              <span>Expense change</span>
              <DeltaValue value={transactionComparison.deltas.expenses} currency={currency} inverse />
            </article>
            <article>
              <span>Net movement</span>
              <DeltaValue value={transactionComparison.deltas.net} currency={currency} />
            </article>
          </div>
          <p className="report-analysis-note">
            {transactionComparison.current.count} current-month transaction{transactionComparison.current.count === 1 ? '' : 's'} versus {transactionComparison.previous.count} last month.
          </p>
        </section>
      </section>

      <section className="grid grid-2 gap-6">
        <section className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Outgoings by category</h3>
          {Object.keys(monthlySummary.byCategory).length === 0 ? (
            <p className="empty-inline">No categories yet.</p>
          ) : (
            <div className="monthly-category-list">
              {Object.entries(monthlySummary.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <article key={category} className="monthly-category-row">
                    <div>
                      <strong>{category}</strong>
                      <span>{formatCurrency(amount, currency)} per month</span>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>

        <section className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Current-month transaction check</h3>
          <div className="grid grid-2 gap-6">
            <div>
              <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Income logged</div>
              <div className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                {formatCurrency(recentTransactionTotals.income, currency)}
              </div>
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Expenses logged</div>
              <div className="text-xl font-bold" style={{ color: 'var(--danger)' }}>
                {formatCurrency(recentTransactionTotals.expenses, currency)}
              </div>
            </div>
          </div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
            {recentTransactions.length} transaction{recentTransactions.length === 1 ? '' : 's'} logged this month.
          </p>
        </section>
      </section>
    </div>
  );
}
