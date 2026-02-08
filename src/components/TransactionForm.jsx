import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TransactionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'income',
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
      type: 'income',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-light mb-6">
        Add Transaction
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="block text-sm font-medium mb-3">
            Type
          </label>
          <div className="type-selector-grid">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`type-button ${
                formData.type === 'income' ? 'type-button-income-active' : 'type-button-inactive'
              }`}
            >
              <TrendingUp size={24} />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`type-button ${
                formData.type === 'expense' ? 'type-button-expense-active' : 'type-button-inactive'
              }`}
            >
              <TrendingDown size={24} />
              <span>Expense</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Monthly salary, Groceries"
          />
        </div>

        <div className="form-group">
          <label>
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
  );
}
