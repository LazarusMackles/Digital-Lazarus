

import React from 'react';
import { Button } from './ui/Button';
import { Icon } from './icons/index';
import { SleuthNote } from './ui';

interface ChallengeVerdictProps {
  onReanalyze: () => void;
  isSecondOpinion: boolean;
}

export const ChallengeVerdict: React.FC<ChallengeVerdictProps> = React.memo(({ onReanalyze, isSecondOpinion }) => {
  if (isSecondOpinion) {
    return (
        <SleuthNote>
            This is my second opinion, based on a more thorough 'Deep Dive' analysis. Cross-referencing multiple forensic angles can often reveal new insights.
        </SleuthNote>
    );
  }
  
  return (
    <div className="flex flex-col items-center gap-6">
        <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">Not convinced? A different perspective enlightens.</p>
        <Button
            onClick={onReanalyze}
            variant="primary"
        >
            Request a Second Opinion
        </Button>
    </div>
  );
});