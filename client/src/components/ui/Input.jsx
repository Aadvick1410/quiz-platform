import React, { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white border border-slate-200 shadow-sm focus:shadow-md ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'focus:border-brand-500 focus:ring-4 focus:ring-brand-100'
        } rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none transition-all duration-300 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
