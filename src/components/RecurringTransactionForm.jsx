import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Calendar } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { FREQUENCY_OPTIONS, calculateNextDate } from '../utils/recurring';
import FormInput from './FormInput';
import { validateAmount, validateDescription, validateCategory, validateDate } from '../utils/validation';

export default function RecurringTransactionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  
  const [errors, setErrors] = useState({});

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const validate = () => {
    const newErrors = {};
    
    const amountError = validateAmount(formData.amount);
    if (amountError) newErrors.amount = amountError;
    
    const descError = validateDescription(formData.description, true);
    if (descError) newErrors.description = descError;
    
    const categoryError = validateCategory(formData.category, true);
    if (categoryError) newErrors.category = categoryError;
    
    const dateError = validateDate(formData.startDate, true);
    if (dateError) newErrors.startDate = dateError;
    
    if (formData.endDate) {
      const endDateObj = new Date(formData.endDate);
      const startDateObj = new Date(formData.startDate);
      if (endDateObj <= startDateObj) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const nextDate = formData.startDate;

    onSubmit({
      type: formData.type,
      amount,
      description: formData.description,
      category: formData.category,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      nextDate,
      active: true
    });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <RefreshCw className="text-primary" size={28} />
        <h2 className="text-2xl font-light">Add Recurring Transaction</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="block text-sm font-medium mb-3">Type</label>
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

        <FormInput
          label="Amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
          required
          error={errors.amount}
        />

        <FormInput
          label="Description"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Netflix Subscription, Monthly Salary"
          required
          error={errors.description}
        />

        <div className="form-group">
          <label>Category {errors.category && <span className="text-red-500 text-sm ml-2">{errors.category}</span>}</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={errors.category ? 'border-red-500' : ''}
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
          <label>Frequency</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-2 gap-4">
          <FormInput
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            error={errors.startDate}
            icon={Calendar}
          />

          <FormInput
            label="End Date (Optional)"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            error={errors.endDate}
            helpText="Leave empty for no end date"
            icon={Calendar}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            <RefreshCw size={18} />
            Create Recurring Transaction
          </button>
          <button type="button" onClick={onCancel} className="btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
