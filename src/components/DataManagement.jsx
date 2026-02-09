import React, { useRef } from 'react';
import { Download, Upload, Trash2, DollarSign, AlertTriangle } from 'lucide-react';
import { CURRENCIES } from '../utils/currency';

const DataManagement = ({ onExport, onImport, onClearAll, onRemoveDuplicates, currency, onCurrencyChange, duplicateCount }) => {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleCurrencyChange = (e) => {
    onCurrencyChange(e.target.value);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-light mb-6">Settings</h2>
      
      <div className="space-y-4">
        {/* Currency Setting */}
        <div className="settings-section">
          <div className="flex-shrink-0" style={{ color: 'var(--primary)' }}>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Currency</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Select your preferred currency for displaying amounts throughout the app.
            </p>
            <div className="form-group mb-0">
              <select 
                value={currency} 
                onChange={handleCurrencyChange}
                className="filter-select w-full max-w-xs"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0' }}></div>

        <h3 className="text-xl font-light mb-4" style={{ color: 'var(--text-primary)' }}>Data Management</h3>

        {/* Remove Duplicates */}
        {duplicateCount > 0 && (
          <div className="settings-section settings-section-warning">
            <div className="flex-shrink-0" style={{ color: 'var(--warning)' }}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Remove Duplicate Transactions</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Found {duplicateCount} duplicate transaction{duplicateCount > 1 ? 's' : ''}. Remove duplicates to clean up your data and fix incorrect balance calculations.
              </p>
              <button onClick={onRemoveDuplicates} className="btn btn-warning text-sm">
                <AlertTriangle className="w-4 h-4" />
                Remove {duplicateCount} Duplicate{duplicateCount > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        <div className="settings-section settings-section-info">
          <div className="flex-shrink-0" style={{ color: 'var(--accent)' }}>
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Export Data</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Download your financial data as a JSON file for backup or transfer to another device.
            </p>
            <button onClick={onExport} className="btn btn-primary text-sm">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="settings-section settings-section-success">
          <div className="flex-shrink-0" style={{ color: 'var(--success)' }}>
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Import Data</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Restore your financial data from a previously exported JSON file. This will replace all current data.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button onClick={handleImportClick} className="btn btn-secondary text-sm">
              <Upload className="w-4 h-4" />
              Import Data
            </button>
          </div>
        </div>

        <div className="settings-section settings-section-danger">
          <div className="flex-shrink-0" style={{ color: 'var(--danger)' }}>
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Clear All Data</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Permanently delete all transactions, goals, and balance data. This action cannot be undone.
            </p>
            <button onClick={onClearAll} className="btn btn-danger text-sm">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
