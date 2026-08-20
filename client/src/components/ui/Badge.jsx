import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-200 text-slate-800 border-slate-800',
    primary: 'bg-indigo-200 text-indigo-900 border-indigo-900',
    success: 'bg-green-200 text-green-900 border-green-900',
    warning: 'bg-yellow-200 text-yellow-900 border-yellow-900',
    danger: 'bg-red-200 text-red-900 border-red-900',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-none border-2 shadow-[2px_2px_0_0_#1e293b] hover:-translate-y-0.5 transition-transform text-xs font-bold uppercase tracking-wider inline-flex items-center ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
