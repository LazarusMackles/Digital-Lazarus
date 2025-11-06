
import React from 'react';
import { Button } from './ui';
import { Icon } from './icons/index';
import type { ForensicMode } from '../types';
import { ModeButton } from './ModeButton';

interface ChallengeVerdictProps {
  onChallenge: (mode: ForensicMode) => void;
  isImageAnalysis: boolean;
}

export const ChallengeVerdict: React.FC<ChallengeVerdictProps> = React.memo(({ onChallenge, isImageAnalysis }) => {
  const renderContent = () => {
    if (isImageAnalysis) {
      return (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-5">
            My deduction may be flawed. Request a second opinion from a different forensic angle.
          </p>
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <ModeButton
                active={false}
                onClick={() => onChallenge('standard')}
                title="Re-evaluate (Standard)"
                description="A balanced second look."
                size="sm"
            />
            <ModeButton
                active={false}
                onClick={() => onChallenge('technical')}
                title="Re-evaluate (Technical)"
                description="Focus on the pixels."
                size="sm"
            />
            <ModeButton
                active={false}
                onClick={() => onChallenge('conceptual')}
                title="Re-evaluate (Conceptual)"
                description="Focus on the story."
                size="sm"
            />
        </div>
        </>
      );
    }
    // Content for text analysis challenge
    return (
      <>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-5">
          My deduction may be flawed. Ask me to take another, more critical look at the evidence.
        </p>
        <Button
          onClick={() => onChallenge('standard')} // 'standard' is a placeholder, text re-analysis ignores it
          variant="secondary"
          className="flex items-center justify-center gap-2 mx-auto"
        >
          <Icon name="chat-bubble-oval-left-ellipsis" className="w-5 h-5" />
          <span>Get a Second Opinion</span>
        </Button>
      </>
    );
  };
  
  return (
    <div className="mt-8 pt-6 border-t border-fuchsia-400/30 dark:border-fuchsia-500/30 w-full max-w-xl">
      <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in-up text-center">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Challenge the Verdict?
        </h3>
        {renderContent()}
      </div>
    </div>
  );
});
