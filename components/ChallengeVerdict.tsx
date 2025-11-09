
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
    <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Not convinced? A different perspective can be enlightening.</p>
        <Button
            onClick={onReanalyze}
            variant="secondary"
            className="flex items-center justify-center gap-2 mx-auto !bg-slate-700 hover:!bg-slate-600 !shadow-slate-900/30"
        >
            <Icon name="chat-bubble-oval-left-ellipsis" className="w-5 h-5" />
            <span>Request a Second Opinion</span>
        </Button>
    </div>
  );
});
