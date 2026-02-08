import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TransactionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const expenseCategories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Other'
  ];

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment',
    'Gift',
    'Other'
  ];

  const categories = formData.type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onSubmit({
      type: formData.type,
      amount,
      description: formData.description || (formData.type === 'income' ? 'Income' : 'Expense'),
      category: formData.category || 'Other',
      date: formData.date
    });

    // Reset form
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="animate-slide-in max-w-2xl mx-auto">
      <div className="stat-card rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold header-font text-slate-800 mb-6">
          Add Transaction
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="mx-auto mb-2" size={24} />
                <span className="font-semibold">Income</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <TrendingDown className="mx-auto mb-2" size={24} />
                <span className="font-semibold">Expense</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors text-lg"
              placeholder="0.00"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="e.g., Monthly salary, Groceries"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 btn-primary text-white font-semibold py-4 rounded-xl shadow-lg"
            >
              Add Transaction
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <style jsx>{`
          .stat-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.5);
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
            transition: all 0.3s ease;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #0d5f58 0%, #047857 100%);
            transform: translateY(-1px);
            box-shadow: 0 8px 16px rgba(15, 118, 110, 0.3);
          }
        `}</style>
      </div>
    </div>
  );
}
