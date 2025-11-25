
import React from 'react';
import type { AnalysisAngle } from '../../types';
import type { AnalysisStage } from '../../context/UIStateContext';

interface LoaderProps {
  message?: string;
  analysisAngleUsed?: AnalysisAngle | null;
  isSecondOpinion?: boolean;
  analysisStage?: AnalysisStage;
}

export const Loader: React.FC<LoaderProps> = React.memo(({ message = "Forensic Scan in Progress...", analysisAngleUsed, isSecondOpinion = false, analysisStage }) => {
  
  const renderSubtext = () => {
    // Round 2: Global Re-verify
    if (isSecondOpinion) {
        return "Re-verifying evidence with stricter parameters.";
    }

    // Provenance
    if (analysisAngleUsed === 'provenance') {
      return "Scanning global sources for matches.";
    }

    // Hybrid (Detailed)
    if (analysisAngleUsed === 'hybrid') {
        if (analysisStage === 'analyzing_pixels') {
            return "Detecting compression anomalies.";
        }
        return "Verifying anomalies with forensic logic.";
    }

    // Forensic (Default)
    return "Examining digital artefacts.";
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center w-full">
      <div className="relative mb-6">
        <svg className="animate-spin h-24 w-24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-200 dark:stroke-slate-700 opacity-25" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#spinner-gradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray="70 283" />
        </svg>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 animate-pulse">
        {message}
      </h2>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 animate-fade-in max-w-sm mx-auto font-medium">
        {renderSubtext()}
      </p>
    </div>
  );
});
