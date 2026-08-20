import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div 
      className={`glass rounded-none ${hover ? 'hover:-translate-y-2 hover:-rotate-1 hover:border-indigo-500 hover:shadow-[8px_8px_0_0_#334155] transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-slate-700/50 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-slate-700/50 bg-slate-800/30 ${className}`}>
    {children}
  </div>
);
