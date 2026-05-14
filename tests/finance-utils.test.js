import { describe, expect, test } from 'vitest';
import { getMonthlyEquivalent } from '../src/utils/financeSummary';
import { getNetWorthTrendData } from '../src/utils/netWorthTrend';
import { getScenarioProjection } from '../src/utils/scenarioPlanner';
import { parseSnapshotCSV } from '../src/utils/snapshotImport';

describe('finance utility calculations', () => {
  test('converts recurring frequencies to monthly equivalents', () => {
    expect(getMonthlyEquivalent(120, 'monthly')).toBe(120);
    expect(getMonthlyEquivalent(1200, 'yearly')).toBe(100);
    expect(getMonthlyEquivalent(30, 'weekly')).toBe(130);
    expect(getMonthlyEquivalent(50, 'biweekly')).toBeCloseTo(108.333, 3);
  });

  test('keeps net worth trend labels on the saved calendar month', () => {
    const trend = getNetWorthTrendData([
      { id: 'later', date: '2026-04-01', santander: 200 },
      { id: 'boundary', date: '2026-03-01', santander: 100 },
    ]);

    expect(trend.map((point) => point.date)).toEqual(['2026-03-01', '2026-04-01']);
    expect(trend[0].label).toBe('Mar 26');
  });

  test('parses supported snapshot CSV dates deterministically', () => {
    const { snapshots, errors } = parseSnapshotCSV(
      [
        'Date,Santander,Notes',
        '12 Jun 2026,100,Text month',
        '2026-07-12,200,ISO',
        '13/08/26,300,Slash',
      ].join('\n'),
      []
    );

    expect(errors).toEqual([]);
    expect(snapshots.map((snapshot) => snapshot.date)).toEqual([
      '2026-06-12',
      '2026-07-12',
      '2026-08-13',
    ]);
  });

  test('rejects ambiguous snapshot CSV dates instead of using native Date parsing', () => {
    const { snapshots, errors } = parseSnapshotCSV(
      [
        'Date,Santander',
        '06.12.2026,100',
        '2026-06-12,200',
      ].join('\n'),
      []
    );

    expect(snapshots).toHaveLength(1);
    expect(errors[0]).toContain('invalid or missing date');
  });

  test('keeps default scenario movement at zero when assumptions are unchanged', () => {
    const projection = getScenarioProjection({
      latestSnapshot: { santander: 1000 },
      recurringTransactions: [
        { id: 'income', type: 'income', amount: 1000, frequency: 'monthly', active: true },
        { id: 'expense', type: 'expense', amount: 400, frequency: 'monthly', active: true },
      ],
      planningItems: [
        {
          id: 'cost',
          type: 'expense',
          status: 'planned',
          targetAmount: 300,
          savedAmount: 0,
          dueDate: '2026-06-15',
        },
      ],
    });

    expect(projection.deltas.projectedMaxCash).toBe(0);
  });
});
