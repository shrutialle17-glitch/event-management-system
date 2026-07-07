import React from 'react';

const Button = ({ children, variant = 'primary', className = '', isLoading = false, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-gradient-primary text-white shadow-button hover:shadow-button-hover hover:-translate-y-1 focus:ring-primary",
    secondary: "bg-secondary hover:bg-secondary-dark text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-secondary",
    outline: "border-2 border-[#00674F] text-[#00674F] bg-transparent hover:bg-[#00674F] hover:text-white transition-all duration-200",
    ghost: "text-textMuted hover:text-text hover:bg-slate-100 focus:ring-slate-200",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-red-400",
    dark: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-slate-700",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes.md} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
