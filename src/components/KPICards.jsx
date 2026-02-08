import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICards({ balance, monthlyIncome, monthlyExpenses }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="stat-card rounded-2xl p-6 shadow-xl card-hover">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <DollarSign className="text-emerald-600" size={28} />
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-light">Current Balance</p>
            <h2 className="text-3xl font-bold header-font text-slate-800">
              {formatCurrency(balance)}
            </h2>
          </div>
        </div>
      </div>

      <div className="stat-card rounded-2xl p-6 shadow-xl card-hover">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <TrendingUp className="text-blue-600" size={28} />
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-light">Monthly Income</p>
            <h2 className="text-3xl font-bold header-font text-slate-800">
              {formatCurrency(monthlyIncome)}
            </h2>
          </div>
        </div>
      </div>

      <div className="stat-card rounded-2xl p-6 shadow-xl card-hover">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-rose-100 p-3 rounded-xl">
            <TrendingDown className="text-rose-600" size={28} />
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-light">Monthly Expenses</p>
            <h2 className="text-3xl font-bold header-font text-slate-800">
              {formatCurrency(monthlyExpenses)}
            </h2>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.5);
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
