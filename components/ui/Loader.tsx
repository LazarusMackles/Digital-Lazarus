import React from 'react';
import type { AnalysisMode, InputType } from '../../types';

interface LoaderProps {
  message?: string;
  analysisMode?: AnalysisMode | null;
  analysisEvidenceType?: InputType | null;
}

export const Loader: React.FC<LoaderProps> = React.memo(({ message = "Deducing the Digital DNA ... ", analysisMode, analysisEvidenceType }) => {
  
  const renderSubtext = () => {
    if (analysisMode === 'deep') {
      return (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 animate-fade-in max-w-sm mx-auto">
            A Deep Dive is underway. This level of scrutiny can take a moment. Thank you for your patience.
        </p>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <svg className="animate-spin h-32 w-32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
        </defs>
        {/* Background track */}
        <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700 opacity-25"
            strokeWidth="8"
        />
        {/* Foreground spinning arc */}
        <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#spinner-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="70 283"
        />
      </svg>
      <h2 className="mt-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">{message}</h2>
      <p className="text-slate-500 dark:text-slate-400">The clues are revealing themselves. One moment while I consult my circuits.</p>
      {renderSubtext()}
    </div>
  );
});
