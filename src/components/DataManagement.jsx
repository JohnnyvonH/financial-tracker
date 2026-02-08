import React, { useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';

const DataManagement = ({ onExport, onImport, onClearAll }) => {
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

  return (
    <div className="card">
      <h2 className="text-2xl font-light mb-6">Data Management</h2>
      
      <div className="space-y-4">
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
            <button onClick={onClearAll} className="btn bg-red-600 hover:bg-red-700 text-white text-sm">
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
