import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`premium-input text-sm
          ${error 
            ? 'border-red-400 focus:border-red-500 bg-red-50/50 text-red-900 placeholder-red-300 !shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
            : ''
          }
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message || error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-textMuted">{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
