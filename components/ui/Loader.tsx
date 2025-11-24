
import React from 'react';
import type { AnalysisAngle } from '../../types';
import { cn } from '../../utils/cn';

interface LoaderProps {
  message?: string;
  analysisAngleUsed?: AnalysisAngle | null;
}

export const Loader: React.FC<LoaderProps> = React.memo(({ message = "Deducing the Digital DNA ... ", analysisAngleUsed }) => {
  
  const renderStep = (label: string, active: boolean, completed: boolean) => (
      <div className="flex items-center gap-2">
          <div className={cn(
              "w-3 h-3 rounded-full transition-colors duration-300",
              active ? "bg-cyan-500 animate-pulse" : completed ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-700"
          )} />
          <span className={cn(
              "text-xs font-semibold transition-colors duration-300",
              active ? "text-cyan-600 dark:text-cyan-400" : completed ? "text-slate-500" : "text-slate-400 dark:text-slate-600"
          )}>{label}</span>
      </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <div className="relative mb-6">
        <svg className="animate-spin h-32 w-32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-200 dark:stroke-slate-700 opacity-25" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#spinner-gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="70 283" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 animate-pulse">
        {message}
      </h2>
      
      <div className="mt-8 flex gap-6">
          {analysisAngleUsed === 'hybrid' && (
              <>
                 {renderStep("Pixel Scan", message.includes("pixels"), !message.includes("pixels"))}
                 <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700 self-center" />
              </>
          )}
          {renderStep("Context Analysis", message.includes("context") || message.includes("Cross-referencing") || message.includes("Deducing"), false)}
      </div>
    </div>
  );
});