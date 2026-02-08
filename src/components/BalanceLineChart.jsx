import React from 'react';
import { Activity } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function BalanceLineChart({ balanceData, currency = 'USD' }) {
  if (!balanceData || balanceData.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Balance Over Time</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-slate-400 mb-4">
            <Activity size={48} />
          </div>
          <p className="text-slate-600">No transaction history available yet</p>
        </div>
      </div>
    );
  }

  // Find min and max balance for scaling
  const balances = balanceData.map(d => d.balance);
  const maxBalance = Math.max(...balances, 0);
  const minBalance = Math.min(...balances, 0);
  const range = maxBalance - minBalance || 1;
  
  const chartHeight = 300;
  const chartWidth = 800;
  const padding = 40;

  // Take every nth point if too many data points
  const maxPoints = 30;
  const step = Math.ceil(balanceData.length / maxPoints);
  const displayData = balanceData.filter((_, i) => i % step === 0 || i === balanceData.length - 1);

  // Create SVG path
  const createPath = () => {
    return displayData.map((point, index) => {
      const x = padding + (index / (displayData.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((point.balance - minBalance) / range) * (chartHeight - padding * 2);
      
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  // Create area under line
  const createArea = () => {
    const path = createPath();
    const lastX = padding + (chartWidth - padding * 2);
    const baseY = chartHeight - padding - ((0 - minBalance) / range) * (chartHeight - padding * 2);
    
    return `${path} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
  };

  const currentBalance = balanceData[balanceData.length - 1].balance;
  const isPositive = currentBalance >= 0;

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-6">Balance Over Time</h3>
      
      <div className="mb-4">
        <div className="text-sm text-slate-600 mb-1">Current Balance</div>
        <div className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(Math.abs(currentBalance), currency)}
        </div>
      </div>

      <div className="relative" style={{ height: `${chartHeight}px`, width: '100%', overflow: 'auto' }}>
        <svg width={chartWidth} height={chartHeight} className="balance-chart">
          {/* Grid lines */}
          <line 
            x1={padding} 
            y1={chartHeight - padding} 
            x2={chartWidth - padding} 
            y2={chartHeight - padding} 
            stroke="#e2e8f0" 
            strokeWidth="1"
          />
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={chartHeight - padding} 
            stroke="#e2e8f0" 
            strokeWidth="1"
          />

          {/* Zero line */}
          {minBalance < 0 && (
            <line
              x1={padding}
              y1={chartHeight - padding - ((0 - minBalance) / range) * (chartHeight - padding * 2)}
              x2={chartWidth - padding}
              y2={chartHeight - padding - ((0 - minBalance) / range) * (chartHeight - padding * 2)}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* Area under line */}
          <path
            d={createArea()}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={createPath()}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {displayData.map((point, index) => {
            const x = padding + (index / (displayData.length - 1)) * (chartWidth - padding * 2);
            const y = chartHeight - padding - ((point.balance - minBalance) / range) * (chartHeight - padding * 2);
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#6366f1"
                  className="chart-point"
                />
              </g>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="mt-6 grid grid-3 gap-4 text-center">
        <div>
          <div className="text-sm text-slate-600 mb-1">Highest</div>
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(maxBalance, currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-600 mb-1">Lowest</div>
          <div className="text-lg font-semibold text-red-600">
            {formatCurrency(minBalance, currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-600 mb-1">Transactions</div>
          <div className="text-lg font-semibold text-slate-900">
            {balanceData.length}
          </div>
        </div>
      </div>
    </div>
  );
}
