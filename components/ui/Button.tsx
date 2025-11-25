
import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'clear' | 'add';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', disabled, ...props }) => {
  const baseClasses = 'font-bold rounded-full transform transition-all duration-300';

  // Specific styles for different variants
  const variantClasses = {
    primary: 'px-12 py-3 text-lg text-white shadow-lg shadow-cyan-500/30',
    secondary: 'flex items-center justify-center gap-2 px-6 py-3 text-white bg-fuchsia-600 shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 hover:-translate-y-0.5',
    clear: 'flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-opacity-90 dark:hover:bg-opacity-90',
    add: 'flex flex-col items-center justify-center aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400',
  };
  
  const clearWrapperClasses = 'p-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500';

  // Special handling for the Primary "Begin Deduction" button disabled state
  if (variant === 'primary') {
      if (disabled) {
          // GRADIENT BORDER IMPLEMENTATION
          // Outer div = Gradient background
          // Inner button = Solid background + margin to create the "border" look
          return (
            <div className={cn("relative p-[2px] rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 opacity-80", className)}>
                <button 
                    className="w-full h-full px-12 py-3 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold text-lg cursor-not-allowed"
                    disabled={true}
                    {...props}
                >
                    {children}
                </button>
            </div>
          );
      }

      const primaryStyles = 'bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 hover:-translate-y-1';

      return (
        <button 
            className={cn(baseClasses, "px-12 py-3 text-lg", primaryStyles, className)} 
            disabled={disabled} 
            {...props}
        >
          {children}
        </button>
      );
  }

  const buttonElement = (
    <button 
        className={cn(
            baseClasses, 
            variantClasses[variant], 
            disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : '',
            className
        )} 
        disabled={disabled} 
        {...props}
    >
      {children}
    </button>
  );

  if (variant === 'clear') {
    return <div className={clearWrapperClasses}>{buttonElement}</div>
  }

  return buttonElement;
};
