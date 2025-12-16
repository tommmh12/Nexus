import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  className?: string;
  selectClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', selectClassName = '', id, ...props }, ref) => {
    const selectId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full bg-white border text-slate-900 text-sm rounded-lg appearance-none
              focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
              transition-colors duration-150 h-10 pl-3 pr-10
              ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-300'}
              ${selectClassName}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
