import React, { useState } from 'react';

export default function GoalForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    current: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = parseFloat(formData.target);
    
    if (!formData.name || isNaN(target) || target <= 0) {
      alert('Please fill in all fields correctly');
      return;
    }

    onSubmit({
      name: formData.name,
      target,
      current: parseFloat(formData.current) || 0
    });

    // Reset form
    setFormData({
      name: '',
      target: '',
      current: 0
    });
  };

  return (
    <div className="animate-slide-in max-w-2xl mx-auto">
      <div className="stat-card rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold header-font text-slate-800 mb-6">
          Create Savings Goal
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Goal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Target Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors text-lg"
              placeholder="0.00"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Current Progress ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 btn-primary text-white font-semibold py-4 rounded-xl shadow-lg"
            >
              Create Goal
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
