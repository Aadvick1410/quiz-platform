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
        className={`w-full px-4 py-2 bg-slate-900 border-2 shadow-[4px_4px_0_0_#1e293b] focus:shadow-[6px_6px_0_0_#1e293b] focus:-translate-y-1 ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-400 focus:border-indigo-500'
        } rounded-none text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-200 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
