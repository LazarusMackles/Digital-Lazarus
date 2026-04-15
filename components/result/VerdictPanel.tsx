

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
    pixelScore?: number;
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


export const VerdictPanel: React.FC<VerdictPanelProps> = React.memo(({ probability, verdict, explanation, analysisAngleUsed, pixelScore }) => {
    const { state: uiState } = useUIState();
    const { analysisStage } = uiState;
    const ANIMATION_DURATION = 800;

    const isAnalysisInProgress = analysisStage === 'analyzing_pixels' || analysisStage === 'analyzing_context';
    const isStreaming = analysisStage === 'analyzing_context';
    const isComplete = analysisStage === 'complete';

    const isHybrid = analysisAngleUsed === 'hybrid';

    const verdictColorClass = () => {
        if (probability < 40) return 'text-teal-500 dark:text-teal-400';
        if (probability < 80) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-rose-500 dark:text-rose-400';
    };
    
    const renderVisualIndicator = () => {
        if (isAnalysisInProgress) {
            return <StreamingProgressIndicator />;
        }
        return <RadialProgress progress={probability} duration={ANIMATION_DURATION} />;
    };
    
    // We show the verdict if it's complete OR if we have a non-placeholder verdict during progress
    const showVerdict = isComplete || (isAnalysisInProgress && verdict && verdict !== 'Investigation in Progress...');
    
    return (
        <div className="w-full max-w-2xl flex flex-col items-center bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-cyan-500/40 dark:border-cyan-400/40">
            {renderVisualIndicator()}

            <div className={`flex flex-col items-center justify-center mt-2`}>
                {showVerdict ? (
                     <h2 className={`text-3xl font-extrabold text-center ${verdictColorClass()} animate-fade-in-up`}>
                        {verdict}
                    </h2>
                ) : (
                    <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-400 animate-fade-in">
                        {isAnalysisInProgress ? 'Deducing ...' : <>&nbsp;</>}
                    </h2>
                )}

                {/* Sensor Status Readout (Vanguard Calibration) */}
                {isComplete && isHybrid && pixelScore !== undefined && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 animate-fade-in">
                        <div className={`w-1.5 h-1.5 rounded-full ${pixelScore < 20 ? 'bg-green-500' : pixelScore > 80 ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Pixel Sensor: {pixelScore}% AI
                        </span>
                    </div>
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