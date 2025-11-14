
import React, { useState, useEffect } from 'react';
import { useUIState } from '../../context/UIStateContext';
import { Icon } from '../icons/index';
import { RadialProgress } from '../ui';
import type { AnalysisAngle } from '../../types';

interface VerdictPanelProps {
    probability: number;
    verdict: string;
    explanation: string;
    analysisAngleUsed?: AnalysisAngle | null;
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


export const VerdictPanel: React.FC<VerdictPanelProps> = React.memo(({ probability, verdict, explanation, analysisAngleUsed }) => {
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

    const isProvenance = analysisAngleUsed === 'provenance';

    const verdictColorClass = () => {
        if (isProvenance) return 'text-cyan-500 dark:text-cyan-400';
        if (probability < 40) return 'text-teal-500 dark:text-teal-400';
        if (probability < 80) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-rose-500 dark:text-rose-400';
    };
    
    const renderVisualIndicator = () => {
        if (isStreaming) {
            return <StreamingProgressIndicator />;
        }
        if (!isProvenance) {
            return <RadialProgress progress={probability} duration={ANIMATION_DURATION} />;
        }
        return null; // No icon for finished provenance reports
    };
    
    // This is the final result view for all analysis types.
    return (
        <div className="w-full max-w-2xl flex flex-col items-center bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-cyan-500/40 dark:border-cyan-400/40">
            {renderVisualIndicator()}

            <div className={`flex items-center justify-center mt-2`}>
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
                isProvenance ? (
                     <div className="mt-3 w-full max-w-xl text-left animate-fade-in">
                        <h3 className="text-lg font-semibold text-center text-fuchsia-600 dark:text-fuchsia-500 mb-4">
                            Investigation Summary
                        </h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                                {explanation.split('\n').filter(line => line.trim().length > 0).slice(0, 5).map((line, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="text-fuchsia-500 mt-1">&#8226;</span>
                                        <span>{line.replace(/^- /, '')}</span>
                                    </li>
                                ))}
                                {isStreaming && (
                                    <li className="flex items-start gap-3">
                                        <span className="text-fuchsia-500 mt-1">&#8226;</span>
                                        <span className="inline-block w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" aria-hidden="true"></span>
                                    </li>
                                )}
                            </ul>
                        </div>
                     </div>
                ) : (
                     <p className="mt-4 text-center max-w-xl text-slate-600 dark:text-slate-300 whitespace-pre-wrap animate-fade-in">
                        {explanation}
                        {isStreaming && (
                            <span className="inline-block w-2 h-5 bg-cyan-500 animate-pulse ml-1" aria-hidden="true"></span>
                        )}
                    </p>
                )
            )}
        </div>
    );
});
