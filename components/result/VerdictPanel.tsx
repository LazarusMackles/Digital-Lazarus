
import React from 'react';
import { useResultState } from '../../context/ResultStateContext';
// FIX: Changed import path from '../icons' to '../icons/index' to resolve ambiguity with an empty 'icons.tsx' file.
import { Icon } from '../icons/index';
import { RadialProgress } from '../ui';

interface VerdictPanelProps {
    probability: number;
    verdict: string;
    explanation: string;
}

export const VerdictPanel: React.FC<VerdictPanelProps> = React.memo(({ probability, verdict, explanation }) => {
    const { state } = useResultState();
    const { isStreaming, analysisEvidence } = state;
    const isTextAnalysis = analysisEvidence?.type === 'text';

    const verdictColorClass = () => {
        if (probability < 40) return 'text-teal-500 dark:text-teal-400';
        if (probability < 75) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-rose-500 dark:text-rose-400';
    };

    const renderStreamPreamble = () => (
      <div className="mb-6 flex items-center justify-center gap-3 text-lg font-semibold text-cyan-600 dark:text-cyan-400">
        <Icon name="light-bulb" className="w-6 h-6 animate-pulse" />
        <span>Live Deduction Stream</span>
      </div>
    );

    return (
        <>
            {isTextAnalysis && isStreaming && renderStreamPreamble()}

            {isTextAnalysis && isStreaming ? (
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-400">Deducing Verdict...</h2>
              </div>
            ) : (
              <>
                <RadialProgress progress={probability} />
                <h2 className={`mt-2 text-3xl font-extrabold text-center ${verdictColorClass()}`}>
                    {verdict}
                </h2>
              </>
            )}
            
            {explanation && (
                <p className="mt-4 text-center max-w-xl text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {explanation}
                    {isTextAnalysis && isStreaming && (
                        <span className="inline-block w-2 h-5 bg-cyan-500 animate-pulse ml-1" aria-hidden="true"></span>
                    )}
                </p>
            )}
        </>
    );
});
