import React from 'react';
import type { ForensicMode } from '../types';
import { ModeButton } from './ModeButton';

interface ForensicModeToggleProps {
  selectedMode: ForensicMode;
  onModeChange: (mode: ForensicMode) => void;
}

export const ForensicModeToggle: React.FC<ForensicModeToggleProps> = ({ selectedMode, onModeChange }) => {
  return (
    <div className="mt-6 mb-8 animate-fade-in">
        <p className="text-sm font-medium text-center text-slate-500 dark:text-slate-400 mb-3">Select Forensic Angle</p>
        <div className="flex flex-col sm:flex-row gap-2">
            <ModeButton
                active={selectedMode === 'standard'}
                onClick={() => onModeChange('standard')}
                title="Standard Analysis"
                description="A balanced look at technical and conceptual clues."
                size="sm"
            />
            <ModeButton
                active={selectedMode === 'technical'}
                onClick={() => onModeChange('technical')}
                title="Technical Forensics"
                description="Focuses only on pixels, lighting, and synthesis artifacts."
                size="sm"
            />
            <ModeButton
                active={selectedMode === 'conceptual'}
                onClick={() => onModeChange('conceptual')}
                title="Conceptual Analysis"
                description="Focuses only on the story, context, and plausibility."
                size="sm"
            />
        </div>
    </div>
  );
};