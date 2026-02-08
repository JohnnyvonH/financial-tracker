import React, { useState } from 'react';
import { Bell, Calendar, DollarSign, Check, Plus, X, Edit2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';

export default function BillReminders({ bills, onAddBill, onUpdateBill, onDeleteBill, currency = 'USD' }) {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'Bills & Utilities',
    isPaid: false,
    recurring: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBill) {
      onUpdateBill(editingBill.id, formData);
    } else {
      onAddBill({
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount)
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
      category: 'Bills & Utilities',
      isPaid: false,
      recurring: true
    });
    setShowForm(false);
    setEditingBill(null);
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData(bill);
    setShowForm(true);
  };

  const togglePaid = (billId) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      onUpdateBill(billId, { ...bill, isPaid: !bill.isPaid });
    }
  };

  // Sort bills by due date
  const sortedBills = [...bills].sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  const upcomingBills = sortedBills.filter(b => !b.isPaid);
  const paidBills = sortedBills.filter(b => b.isPaid);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Bell className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Bill Reminders</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          Add Bill
        </button>
      </div>

      {showForm && (
        <div className="bill-form mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label>Bill Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Electricity Bill"
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Amount</label>
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
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                {editingBill ? 'Update' : 'Add'} Bill
              </button>
              <button type="button" onClick={resetForm} className="btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {upcomingBills.length === 0 && paidBills.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          No bills added yet. Add your first bill to get started!
        </div>
      ) : (
        <>
          {upcomingBills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                Upcoming ({upcomingBills.length})
              </h3>
              <div className="space-y-3">
                {upcomingBills.map((bill) => {
                  const daysUntilDue = Math.ceil(
                    (new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;
                  
                  return (
                    <div key={bill.id} className="bill-item">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => togglePaid(bill.id)}
                          className="bill-checkbox"
                        >
                          {bill.isPaid && <Check size={14} />}
                        </button>
                        <div className="flex-1">
                          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {bill.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(bill.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className="text-danger font-semibold">
                                {Math.abs(daysUntilDue)} days overdue
                              </span>
                            )}
                            {isDueSoon && (
                              <span className="text-warning font-semibold">
                                Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(bill.amount, currency)}
                          </span>
                          <button
                            onClick={() => handleEdit(bill)}
                            className="btn-icon"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteBill(bill.id)}
                            className="btn-icon"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {paidBills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                Paid ({paidBills.length})
              </h3>
              <div className="space-y-2">
                {paidBills.map((bill) => (
                  <div key={bill.id} className="bill-item bill-item-paid">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => togglePaid(bill.id)}
                        className="bill-checkbox bill-checkbox-checked"
                      >
                        <Check size={14} />
                      </button>
                      <div className="flex-1">
                        <h4 className="font-medium" style={{ color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                          {bill.name}
                        </h4>
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(bill.amount, currency)}
                      </span>
                      <button
                        onClick={() => onDeleteBill(bill.id)}
                        className="btn-icon"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
