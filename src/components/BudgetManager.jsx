import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function BudgetManager({ budgets, currentMonthSpending, onUpdateBudgets }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ category: '', amount: '' });

  const expenseCategories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Other'
  ];

  const handleAdd = () => {
    if (!formData.category || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid category and amount');
      return;
    }

    const newBudgets = {
      ...budgets,
      [formData.category]: parseFloat(formData.amount)
    };

    onUpdateBudgets(newBudgets);
    setFormData({ category: '', amount: '' });
    setIsAdding(false);
  };

  const handleEdit = (category) => {
    setEditingId(category);
    setFormData({ category, amount: budgets[category].toString() });
  };

  const handleSaveEdit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const newBudgets = { ...budgets };
    delete newBudgets[editingId];
    newBudgets[formData.category] = parseFloat(formData.amount);

    onUpdateBudgets(newBudgets);
    setEditingId(null);
    setFormData({ category: '', amount: '' });
  };

  const handleDelete = (category) => {
    if (!confirm(`Delete budget for ${category}?`)) return;

    const newBudgets = { ...budgets };
    delete newBudgets[category];
    onUpdateBudgets(newBudgets);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ category: '', amount: '' });
  };

  const availableCategories = expenseCategories.filter(cat => !budgets[cat] || cat === editingId);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Monthly Budgets</h3>
        {!isAdding && !editingId && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            <Plus size={18} />
            Add Budget
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="budget-form">
          <div className="grid grid-2 gap-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={editingId !== null}
              >
                <option value="">Select category</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Budget Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingId ? handleSaveEdit : handleAdd}
              className="btn btn-primary"
            >
              <Check size={18} />
              {editingId ? 'Save' : 'Add'}
            </button>
            <button onClick={handleCancel} className="btn">
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Budget List */}
      {Object.keys(budgets).length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          No budgets set yet. Add your first budget to start tracking!
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {Object.entries(budgets).map(([category, budgetAmount]) => {
            const spent = currentMonthSpending[category] || 0;
            const remaining = budgetAmount - spent;
            const percentage = Math.min((spent / budgetAmount) * 100, 100);
            const isOverBudget = spent > budgetAmount;

            return (
              <div key={category} className="budget-item">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{category}</h4>
                    <div className="text-sm text-slate-600 mt-1">
                      ${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })} of 
                      ${budgetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn-icon-small"
                      title="Edit budget"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="btn-icon-small text-red-600"
                      title="Delete budget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="progress-bar" style={{ height: '8px' }}>
                  <div
                    className={`progress-fill ${isOverBudget ? 'bg-red-500' : ''}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm font-medium ${
                    isOverBudget ? 'text-red-600' : remaining < budgetAmount * 0.2 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {isOverBudget 
                      ? `$${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })} over budget`
                      : `$${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining`
                    }
                  </span>
                  <span className="text-sm text-slate-600">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
