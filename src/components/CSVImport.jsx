import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';

export default function CSVImport({ onImport, onClose }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const transactions = parseCSV(csvText);
        
        if (transactions.length === 0) {
          setError('No valid transactions found in CSV file');
          return;
        }

        setPreview(transactions);
      } catch (err) {
        setError(err.message || 'Failed to parse CSV file');
      }
    };

    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
      setPreview(null);
      onClose();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-primary" size={28} />
        <h2 className="text-2xl font-light">Import from CSV</h2>
      </div>

      <div className="space-y-4">
        <div className="settings-section settings-section-info">
          <div className="flex-shrink-0" style={{ color: 'var(--accent)' }}>
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>CSV Format Requirements</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your CSV file should have the following columns:
            </p>
            <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
              <li>• <strong>Date</strong> (YYYY-MM-DD or MM/DD/YYYY)</li>
              <li>• <strong>Description</strong> (transaction name)</li>
              <li>• <strong>Amount</strong> (positive for income, negative for expenses)</li>
              <li>• <strong>Category</strong> (optional)</li>
            </ul>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-primary w-full"
        >
          <Upload size={18} />
          Select CSV File
        </button>

        {error && (
          <div className="settings-section settings-section-danger">
            <AlertCircle size={20} />
            <p style={{ color: 'var(--text-primary)' }}>{error}</p>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="settings-section settings-section-success">
              <CheckCircle size={20} />
              <p style={{ color: 'var(--text-primary)' }}>
                Found {preview.length} transaction{preview.length !== 1 ? 's' : ''} ready to import
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {preview.slice(0, 5).map((transaction, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {transaction.description}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                      </div>
                    </div>
                    <div
                      className="font-bold"
                      style={{ color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)' }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}£{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              {preview.length > 5 && (
                <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  ...and {preview.length - 5} more
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleImport} className="btn btn-primary flex-1">
                <CheckCircle size={18} />
                Import {preview.length} Transaction{preview.length !== 1 ? 's' : ''}
              </button>
              <button onClick={() => setPreview(null)} className="btn">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
