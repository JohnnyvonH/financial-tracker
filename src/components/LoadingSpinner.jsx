import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader size={sizes[size]} className="animate-spin text-primary" />
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
