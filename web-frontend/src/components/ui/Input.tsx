import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', inputClassName = '', id, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-white border text-slate-900 text-sm rounded-lg
              focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
              transition-colors duration-150 placeholder:text-slate-400
              ${leftIcon ? 'pl-10' : 'pl-3'} 
              ${rightIcon ? 'pr-10' : 'pr-3'}
              ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-300'}
              h-10 ${inputClassName}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
