
import React from 'react';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const ContentBox: React.FC<ContentBoxProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-slate-100 dark:bg-slate-800/80 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-4">{title}</h3>}
      {children}
    </div>
  );
};
