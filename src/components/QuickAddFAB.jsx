import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import TransactionForm from './TransactionForm';

export default function QuickAddFAB({ onAddTransaction, currency }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (transaction) => {
    onAddTransaction(transaction);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="quick-add-fab"
        title="Quick Add Transaction"
      >
        <Plus size={24} />
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div 
            className="modal-overlay"
            onClick={() => setIsOpen(false)}
          />
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="text-xl font-semibold">Quick Add Transaction</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-icon"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <TransactionForm
                onSubmit={handleAdd}
                onCancel={() => setIsOpen(false)}
                currency={currency}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
