import { getSnapshotTotals } from './financeSummary';

const parseSnapshotDate = (snapshot = {}) => {
  if (!snapshot.date) return null;
  const [year, month, day] = String(snapshot.date).split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

export function getNetWorthTrendData(snapshots = []) {
  return snapshots
    .map((snapshot) => {
      const date = parseSnapshotDate(snapshot);
      if (!date) return null;

      const totals = getSnapshotTotals(snapshot);

      return {
        id: snapshot.id || snapshot.date,
        date: snapshot.date,
        label: date.toLocaleDateString('en-GB', {
          month: 'short',
          year: '2-digit',
        }),
        maxAvailableCash: totals.maxAvailableCash,
        availableAssets: totals.availableAssets,
        houseDepositAccess: totals.houseDepositAccessibleAssets,
        allWealth: totals.allAssets,
        pension: totals.pension,
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export function getNetWorthTrendSummary(snapshots = []) {
  const trendData = getNetWorthTrendData(snapshots);

  if (trendData.length === 0) {
    return {
      trendData,
      latest: null,
      previous: null,
      deltas: {
        maxAvailableCash: 0,
        availableAssets: 0,
        allWealth: 0,
      },
    };
  }

  const latest = trendData[trendData.length - 1];
  const previous = trendData.length > 1 ? trendData[trendData.length - 2] : null;

  return {
    trendData,
    latest,
    previous,
    deltas: {
      maxAvailableCash: previous ? latest.maxAvailableCash - previous.maxAvailableCash : 0,
      availableAssets: previous ? latest.availableAssets - previous.availableAssets : 0,
      allWealth: previous ? latest.allWealth - previous.allWealth : 0,
    },
  };
}
