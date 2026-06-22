import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && <label className="mb-1 text-sm font-medium text-text">{label}</label>}
      <input
        ref={ref}
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-shadow
          ${error 
            ? 'border-red-500 focus:ring-red-200 bg-red-50 text-red-900' 
            : 'border-gray-300 focus:ring-primary/50 focus:border-primary bg-white'
          }
        `}
        {...props}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error.message || error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
