import React from 'react';
import { Button } from './ui/Button';
import { Icon } from './icons/index';
import { SleuthNote } from './SleuthNote';

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
    <div className="flex flex-col items-center gap-3">
        <p className="font-semibold text-slate-500 dark:text-slate-400">Not convinced? A different perspective can be enlightening.</p>
        <Button
            onClick={onReanalyze}
            variant="secondary"
        >
            <Icon name="chat-bubble-oval-left-ellipsis" className="w-5 h-5" />
            <span>Request a Second Opinion</span>
        </Button>
    </div>
  );
});