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
      <div className="stat-card rounded-2xl shadow-xl" style={{ padding: '2rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.875rem' }}>
          Create Savings Goal
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Goal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Target Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="form-input"
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">
              Current Progress ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
              className="form-input"
              placeholder="0.00"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
            >
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
