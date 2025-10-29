import React from 'react';
import type { AnalysisMode } from '../types';

interface ModeSelectorProps {
  selectedMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
}

const ModeButton: React.FC<{
    active: boolean;
    onClick: () => void;
    title: string;
    description: string;
}> = ({ active, onClick, title, description }) => {
    return (
        <button
            onClick={onClick}
            className={`w-1/2 p-4 text-left rounded-lg transition-all duration-300 border ${
                active
                    ? 'bg-cyan-500/10 border-cyan-500'
                    : 'bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
        >
            <p className={`font-bold ${active ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-800 dark:text-white'}`}>{title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </button>
    );
};


export const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  return (
    <div className="mt-6 mb-8">
        <p className="text-sm font-medium text-center text-slate-500 dark:text-slate-400 mb-3">Select Deductive Method</p>
        <div className="flex gap-4">
            <ModeButton
                active={selectedMode === 'quick'}
                onClick={() => onModeChange('quick')}
                title="Quick Scan"
                description="A fast, brilliant first-pass. Excellent for most cases."
            />
            <ModeButton
                active={selectedMode === 'deep'}
                onClick={() => onModeChange('deep')}
                title="Deep Analysis"
                description="A more profound, methodical examination. Takes longer but is more thorough."
            />
        </div>
    </div>
  );
};