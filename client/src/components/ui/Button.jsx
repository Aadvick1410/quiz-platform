import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-100 rounded-none shadow-[4px_4px_0_0_#1e293b] hover:shadow-[6px_6px_0_0_#1e293b] hover:-translate-y-1 active:translate-y-2 active:shadow-none';
  
  const variants = {
    primary: 'bg-indigo-600 text-slate-100 hover:bg-indigo-500',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    ghost: 'bg-transparent text-slate-200 hover:text-slate-100 hover:bg-slate-800 shadow-none border-transparent hover:border-slate-100 hover:shadow-[4px_4px_0_0_#1e293b]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
