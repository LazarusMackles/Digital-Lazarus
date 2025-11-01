
import React from 'react';
import { ModeButton } from './ModeButton';
import type { ForensicMode } from '../types';

interface ChallengeVerdictProps {
  onChallenge: (mode: ForensicMode) => void;
}

export const ChallengeVerdict: React.FC<ChallengeVerdictProps> = React.memo(({ onChallenge }) => {
  return (
    <div className="mt-8 pt-6 border-t border-fuchsia-400/30 dark:border-fuchsia-500/30 w-full max-w-xl">
      <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in-up">
        <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Challenge the Verdict & Look Closer
        </h3>
        <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-1 mb-5">
          My deduction may be flawed. Guide my re-analysis by choosing a forensic angle below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <ModeButton
            active={false}
            onClick={() => onChallenge('technical')}
            title="Focus on Technical"
            description="Analyse pixels, lighting, and textures."
            size="sm"
            titleStyle="gradient"
          />
          <ModeButton
            active={false}
            onClick={() => onChallenge('conceptual')}
            title="Focus on Conceptual"
            description="Analyse context, subject, and overall 'feel'."
            size="sm"
            titleStyle="gradient"
          />
        </div>
      </div>
    </div>
  );
});
