import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col w-full gap-1 ${className}`}>
      {label && (
        <label className="text-[13px] font-semibold text-slate-700 tracking-wide mb-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-text text-sm transition-all duration-250 ease-smooth placeholder-slate-400 focus:outline-none focus:ring-4
            ${error 
              ? 'border-error/50 focus:border-error focus:ring-error/10 bg-error/5 text-error' 
              : 'border-slate-200 focus:border-primary focus:ring-primary/10 hover:border-slate-300 shadow-soft'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[13px] text-error font-medium flex items-center gap-1.5 mt-1 animate-fade-in-up">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message || error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-[13px] text-textMuted mt-0.5">{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
