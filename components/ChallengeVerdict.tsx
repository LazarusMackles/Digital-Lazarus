import React from 'react';
import { Button } from './ui/Button';
import { SleuthNote } from './ui';
import type { AnalysisMode } from '../types';

interface ChallengeVerdictProps {
  onReanalyze: () => void;
  isSecondOpinion: boolean;
  analysisModeUsed?: AnalysisMode | null;
}

export const ChallengeVerdict: React.FC<ChallengeVerdictProps> = React.memo(({ onReanalyze, isSecondOpinion }) => {
  // Case 1: This is a re-analysis (a second opinion). The investigation concludes here.
  if (isSecondOpinion) {
    return (
        <SleuthNote>
            This is my second opinion, based on a more thorough 'Deep Dive' analysis. Cross-referencing multiple forensic angles can often reveal new insights.
        </SleuthNote>
    );
  }

  // Case 2 (Default): This is the first analysis. Offer a second opinion, regardless of the initial method.
  return (
    <div className="flex flex-col items-center gap-6">
        <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 text-center">Not convinced? A different perspective enlightens.</p>
        <Button
            onClick={onReanalyze}
            variant="primary"
        >
            Request a Second Opinion
        </Button>
    </div>
  );
});