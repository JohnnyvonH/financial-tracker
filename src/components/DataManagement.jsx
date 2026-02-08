import React, { useRef } from 'react';
import { Download, Upload, Trash2, DollarSign } from 'lucide-react';
import { CURRENCIES } from '../utils/currency';

const DataManagement = ({ onExport, onImport, onClearAll, currency, onCurrencyChange }) => {
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
        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex-shrink-0 text-slate-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-900 mb-1">Currency</h3>
            <p className="text-sm text-slate-600 mb-3">
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

        <div className="border-t border-slate-200 my-6"></div>

        <h3 className="text-xl font-light mb-4">Data Management</h3>

        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-shrink-0 text-blue-600">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Export Data</h3>
            <p className="text-sm text-blue-700 mb-3">
              Download your financial data as a JSON file for backup or transfer to another device.
            </p>
            <button onClick={onExport} className="btn btn-primary text-sm">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0 text-green-600">
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-900 mb-1">Import Data</h3>
            <p className="text-sm text-green-700 mb-3">
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

        <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex-shrink-0 text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-900 mb-1">Clear All Data</h3>
            <p className="text-sm text-red-700 mb-3">
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
