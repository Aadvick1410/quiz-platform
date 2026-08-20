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
        className={`w-full px-4 py-2 bg-slate-800/50 border ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
        } rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
