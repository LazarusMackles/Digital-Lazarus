import React from 'react';
import type { AnalysisMode, InputType } from '../types';

interface LoaderProps {
  message?: string;
  analysisMode?: AnalysisMode | null;
  analysisEvidenceType?: InputType | null;
}

export const Loader: React.FC<LoaderProps> = React.memo(({ message = "Deducing the Digital DNA ... ", analysisMode, analysisEvidenceType }) => {
  
  const renderSubtext = () => {
    if (analysisEvidenceType === 'url') {
      return (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 animate-fade-in">
            *Fetching website content can take a moment, especially for complex pages. Thank you for your patience.*
        </p>
      );
    }
    if (analysisMode === 'deep') {
      return (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 animate-fade-in">
            *Deep Dives are powerful, but may time out due to platform limits. If this occurs, a 'Quick Scan' is recommended.*
        </p>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <svg className="animate-spin h-12 w-12 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" /> 
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
        </defs>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="url(#spinner-gradient)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="mt-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">{message}</h2>
      <p className="text-slate-500 dark:text-slate-400">The clues are revealing themselves. One moment while I consult my circuits.</p>
      {renderSubtext()}
    </div>
  );
});