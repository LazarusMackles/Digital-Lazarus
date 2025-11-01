import React from 'react';
import type { AnalysisMode } from '../types';
import { ModeButton } from './ModeButton';

interface ModeSelectorProps {
  selectedMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = React.memo(({ selectedMode, onModeChange }) => {
  return (
    <div className="mt-6 mb-8">
        <p className="text-sm font-medium text-center text-cyan-600 dark:text-cyan-400 mb-3">Select Deductive Method</p>
        <div className="flex flex-col sm:flex-row gap-4">
            <ModeButton
                active={selectedMode === 'quick'}
                onClick={() => onModeChange('quick')}
                title="Quick Scan"
                description="A fast, brilliant first-pass. Excellent for most cases."
                size="md"
            />
            <ModeButton
                active={selectedMode === 'deep'}
                onClick={() => onModeChange('deep')}
                title="Deep Analysis"
                description="A more profound, methodical examination. Takes longer but is more thorough."
                size="md"
            />
        </div>
    </div>
  );
});