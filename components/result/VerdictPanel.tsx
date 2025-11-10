
import React, { useState, useEffect } from 'react';
import { useUIState } from '../../context/UIStateContext';
import { Icon } from '../icons/index';
import { RadialProgress } from '../RadialProgress';

interface VerdictPanelProps {
    probability: number;
    verdict: string;
    explanation: string;
}

const StreamingProgressIndicator: React.FC = () => (
    <div className="relative w-48 h-48 animate-pulse">
        <svg height={192} width={192} className="transform -rotate-90">
            <circle
                className="stroke-slate-200 dark:stroke-slate-700"
                fill="transparent"
                strokeWidth={12}
                r={80}
                cx={96}
                cy={96}
            />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            <Icon name="light-bulb" className="w-10 h-10 text-cyan-500 dark:text-cyan-400" />
        </div>
    </div>
);


export const VerdictPanel: React.FC<VerdictPanelProps> = React.memo(({ probability, verdict, explanation }) => {
    const { state: uiState } = useUIState();
    const { isStreaming } = uiState;
    const [verdictVisible, setVerdictVisible] = useState(false);
    const ANIMATION_DURATION = 1200; // ms

    useEffect(() => {
      // This effect triggers the verdict text animation.
      // It runs when streaming finishes, or if the analysis was never streaming.
      if (!isStreaming) {
        const timer = setTimeout(() => {
          setVerdictVisible(true);
        }, ANIMATION_DURATION); // Fire just after the progress animation.

        return () => clearTimeout(timer);
      } else {
        // If a new streaming session starts (e.g., re-analysis), hide the verdict again.
        setVerdictVisible(false);
      }
    }, [isStreaming]);


    const verdictColorClass = () => {
        if (probability < 40) return 'text-teal-500 dark:text-teal-400';
        if (probability < 75) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-rose-500 dark:text-rose-400';
    };
    
    // This is the final result view for all analysis types.
    return (
        <div className="w-full max-w-2xl flex flex-col items-center bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-cyan-500/40 dark:border-cyan-400/40">
            {isStreaming ? 
                <StreamingProgressIndicator /> : 
                <RadialProgress progress={probability} duration={ANIMATION_DURATION} />
            }

            <div className="h-10 mt-2 flex items-center justify-center">
                {verdictVisible ? (
                     <h2 className={`text-3xl font-extrabold text-center ${verdictColorClass()} animate-fade-in-up`}>
                        {verdict}
                    </h2>
                ) : (
                    // Placeholder to prevent layout shift while waiting for animation,
                    // or show the streaming status.
                    <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-400 animate-fade-in">
                        {isStreaming ? 'Deducing ...' : <>&nbsp;</>}
                    </h2>
                )}
            </div>
            
            {explanation && (
                <p className="mt-4 text-center max-w-xl text-slate-600 dark:text-slate-300 whitespace-pre-wrap animate-fade-in">
                    {explanation}
                    {isStreaming && (
                        <span className="inline-block w-2 h-5 bg-cyan-500 animate-pulse ml-1" aria-hidden="true"></span>
                    )}
                </p>
            )}
        </div>
    );
});
