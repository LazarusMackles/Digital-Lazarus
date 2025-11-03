import React from 'react';
import type { ForensicMode } from '../types';
import { ModeButton } from './ModeButton';

interface ForensicModeToggleProps {
  selectedMode: ForensicMode;
  onModeChange: (mode: ForensicMode) => void;
}

export const ForensicModeToggle: React.FC<ForensicModeToggleProps> = React.memo(({ selectedMode, onModeChange }) => {
  return (
    <fieldset className="mt-6 mb-8 animate-fade-in w-full border-none p-0">
        <legend className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-3 text-center w-full">Select Forensic Angle</legend>
        <div className="w-full flex flex-col sm:flex-row gap-2">
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
    </fieldset>
  );
});