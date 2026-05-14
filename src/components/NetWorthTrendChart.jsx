import React, { useMemo } from 'react';
import { TrendingUp, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getNetWorthTrendSummary } from '../utils/netWorthTrend';

function TrendDelta({ label, value, currency }) {
  const tone = value >= 0 ? 'positive' : 'danger';

  return (
    <article className={`trend-delta trend-delta-${tone}`}>
      <span>{label}</span>
      <strong>{value >= 0 ? '+' : '-'}{formatCurrency(Math.abs(value), currency)}</strong>
      <small>Since previous snapshot</small>
    </article>
  );
}

function NetWorthSvgChart({ data, currency }) {
  const width = 900;
  const height = 320;
  const padding = { top: 24, right: 28, bottom: 44, left: 86 };
  const series = [
    { key: 'availableAssets', label: 'Available assets', color: '#10b981' },
    { key: 'houseDepositAccess', label: 'House deposit access', color: '#f59e0b' },
    { key: 'allWealth', label: 'All wealth', color: '#38bdf8' },
  ];
  const values = data.flatMap((point) => series.map((item) => point[item.key]));
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const range = maxValue - minValue || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const xFor = (index) => padding.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const yFor = (value) => padding.top + innerHeight - ((value - minValue) / range) * innerHeight;
  const gridValues = [0, 0.5, 1].map((step) => minValue + range * step);

  const pathFor = (key) => data
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point[key])}`)
    .join(' ');

  return (
    <div className="net-worth-chart-wrap" aria-label="Net worth trend chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Net worth trend chart">
        <title>Net worth trend chart</title>
        {gridValues.map((value) => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="trend-grid-line" />
              <text x={padding.left - 12} y={y + 4} textAnchor="end" className="trend-axis-label">
                {formatCurrency(value, currency)}
              </text>
            </g>
          );
        })}
        {data.map((point, index) => (
          <text key={point.id} x={xFor(index)} y={height - 12} textAnchor="middle" className="trend-axis-label">
            {point.label}
          </text>
        ))}
        {series.map((item) => (
          <g key={item.key}>
            <path d={pathFor(item.key)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((point, index) => (
              <circle key={`${item.key}-${point.id}`} cx={xFor(index)} cy={yFor(point[item.key])} r="4" fill={item.color} />
            ))}
          </g>
        ))}
      </svg>
      <div className="trend-legend">
        {series.map((item) => (
          <span key={item.key}>
            <i style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function NetWorthTrendChart({ snapshots = [], currency = 'USD' }) {
  const summary = useMemo(() => getNetWorthTrendSummary(snapshots), [snapshots]);
  const { trendData, latest, previous, deltas } = summary;

  if (trendData.length === 0) {
    return (
      <section className="card net-worth-trend-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Net worth trend</h2>
            <p>No current finance snapshots yet. Add snapshots to see progress over time.</p>
          </div>
          <WalletCards size={22} />
        </div>
      </section>
    );
  }

  return (
    <section className="card net-worth-trend-card">
      <div className="dashboard-section-header">
        <div>
          <h2>Net worth trend</h2>
          <p>
            {trendData.length === 1
              ? 'One snapshot saved. Add another to unlock movement over time.'
              : `${trendData.length} snapshots from ${trendData[0].label} to ${latest.label}.`}
          </p>
        </div>
        <TrendingUp size={22} />
      </div>

      <div className="trend-summary-grid">
        <article>
          <span>Latest available assets</span>
          <strong>{formatCurrency(latest.availableAssets, currency)}</strong>
        </article>
        <article>
          <span>House deposit access</span>
          <strong>{formatCurrency(latest.houseDepositAccess, currency)}</strong>
        </article>
        <article>
          <span>All wealth</span>
          <strong>{formatCurrency(latest.allWealth, currency)}</strong>
        </article>
      </div>

      {previous && (
        <div className="trend-delta-grid" aria-label="Snapshot movement">
          <TrendDelta label="Max cash" value={deltas.maxAvailableCash} currency={currency} />
          <TrendDelta label="Available assets" value={deltas.availableAssets} currency={currency} />
          <TrendDelta label="All wealth" value={deltas.allWealth} currency={currency} />
        </div>
      )}

      <NetWorthSvgChart data={trendData} currency={currency} />
    </section>
  );
}
