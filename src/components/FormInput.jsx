import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormInput = ({ 
  label, 
  error, 
  type = 'text', 
  required = false,
  helpText,
  icon: Icon,
  ...props 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="flex items-center gap-2">
          {Icon && <Icon size={16} />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          className={`w-full ${error ? 'border-red-500 focus:border-red-500' : ''}`}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-slate-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

export default FormInput;
