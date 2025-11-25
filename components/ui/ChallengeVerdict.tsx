
import React from 'react';
import { Button } from './Button';
import { SleuthNote } from './SleuthNote';

interface ChallengeVerdictProps {
  onReanalyze: () => void;
  isSecondOpinion: boolean;
}

export const ChallengeVerdict: React.FC<ChallengeVerdictProps> = React.memo(({ onReanalyze, isSecondOpinion }) => {
  // Case 1: This is a re-analysis (a second opinion). The investigation concludes here.
  if (isSecondOpinion) {
    return (
        <SleuthNote>
            Independent review complete. I have re-examined the evidence to verify the integrity of the initial findings.
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
