import React, { useState } from 'react';
import { Target } from 'lucide-react';

export default function GoalForm({ onSubmit, onCancel, currency = 'USD' }) {
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
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Target className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Create Savings Goal</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Goal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Target Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Current Progress (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Target size={18} />
              Create Goal
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
