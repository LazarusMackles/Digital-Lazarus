import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'clear' | 'add';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = 'font-bold rounded-full transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  const variantClasses = {
    primary: 'px-10 py-4 text-white bg-gradient-to-r from-cyan-600 to-fuchsia-600 shadow-lg shadow-cyan-500/30 hover:from-cyan-500 hover:to-fuchsia-500 hover:-translate-y-1',
    secondary: 'flex items-center justify-center gap-2 px-6 py-3 text-white bg-fuchsia-600 shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 hover:-translate-y-0.5',
    clear: 'flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-opacity-90 dark:hover:bg-opacity-90',
    add: 'flex flex-col items-center justify-center aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400',
  };
  
  const clearWrapperClasses = 'p-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500';

  const buttonElement = (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );

  if (variant === 'clear') {
    return <div className={clearWrapperClasses}>{buttonElement}</div>
  }

  return buttonElement;
};
