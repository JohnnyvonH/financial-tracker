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
      <div className="stat-card rounded-2xl shadow-xl" style={{ padding: '2rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.875rem' }}>
          Add Transaction
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Type
            </label>
            <div className="type-selector">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`type-option ${formData.type === 'income' ? 'type-option-income' : ''}`}
              >
                <TrendingUp size={24} />
                <span>Income</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`type-option ${formData.type === 'expense' ? 'type-option-expense' : ''}`}
              >
                <TrendingDown size={24} />
                <span>Expense</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-input"
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              placeholder="e.g., Monthly salary, Groceries"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Transaction
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
