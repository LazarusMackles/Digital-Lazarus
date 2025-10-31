import React, { useState } from 'react';
import type { ForensicMode } from '../types';
import { ShareIcon, ArrowPathIcon } from './icons';
import { ShareModal } from './ShareModal';
import { RadialProgress } from './RadialProgress';
import { Loader } from './Loader';
import { Feedback } from './Feedback';
import { SleuthNote } from './SleuthNote';
import { HighlightsDisplay } from './HighlightsDisplay';
import { ModeButton } from './ModeButton';
import { useAnalysis } from '../context/AnalysisContext';

export const ResultDisplay: React.FC = () => {
  const { 
    analysisResult: result, 
    handleChallenge, 
    isChallenged, 
    handleNewAnalysis, 
    isLoading 
  } = useAnalysis();
    
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [challengeStep, setChallengeStep] = useState<'initial' | 'options'>('initial');
  
  if (!result) return null; // Should not happen if rendered, but a good safeguard

  const hasHighlights = result.highlights && result.highlights.length > 0;
  const showChallengeButton = !isChallenged && result.probability < 50;

  const handleChallengeClick = () => {
    setChallengeStep('options');
  }

  const handleChallengeOptionClick = (mode: ForensicMode) => {
    handleChallenge(mode);
    setChallengeStep('initial'); // Reset for next potential result
  }

  return (
    <>
      {isShareModalOpen && <ShareModal result={result} onClose={() => setIsShareModalOpen(false)} />}
      <div className="relative">
        <button 
          onClick={handleNewAnalysis} 
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-semibold z-20"
          aria-label="Begin New Analysis"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>New Analysis</span>
        </button>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl p-4">
            <div className="bg-white dark:bg-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
              <Loader message="Re-analysing with a critical eye..." />
            </div>
          </div>
        )}
        <div className="flex flex-col items-center text-center animate-fade-in bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
            <RadialProgress progress={result.probability} />
            
            {isChallenged && (
                <p className="mt-6 font-semibold text-cyan-600 dark:text-cyan-400">Second Opinion</p>
            )}
            <h2 className={`text-3xl font-bold ${isChallenged ? 'mt-1' : 'mt-6'}`}>{result.verdict}</h2>

            <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-xl">{result.explanation}</p>
            
            {hasHighlights && <HighlightsDisplay highlights={result.highlights!} />}
            
            {showChallengeButton && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl flex flex-col items-center">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Think I've missed something?</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Let's solve this case together.</p>
                    {challengeStep === 'initial' && (
                       <button
                           onClick={handleChallengeClick}
                           className="px-6 py-2 font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 transform hover:-translate-y-0.5 transition-all duration-200"
                       >
                           Challenge the Verdict &amp; Look Closer 🔬
                       </button>
                    )}
                    {challengeStep === 'options' && (
                        <div className="w-full animate-fade-in-up">
                            <p className="text-sm font-medium text-center text-slate-500 dark:text-slate-400 mb-3">How should I re-evaluate the evidence?</p>
                             <div className="flex flex-col sm:flex-row gap-2">
                                <ModeButton
                                    active={false}
                                    onClick={() => handleChallengeOptionClick('technical')}
                                    title="Focus on Technical Clues"
                                    description="Analyse pixels, lighting, and textures."
                                    size="sm"
                                />
                                <ModeButton
                                    active={false}
                                    onClick={() => handleChallengeOptionClick('conceptual')}
                                    title="Focus on Conceptual Clues"
                                    description="Analyse context, subject, and overall 'feel'."
                                    size="sm"
                                />
                            </div>
                        </div>
                    )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl flex flex-col items-center">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full transition-all duration-200 text-sm"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Share Forensic Report</span>
              </button>

              <Feedback />
            </div>

            <SleuthNote />

            <div className="mt-8 flex justify-center">
              <button onClick={handleNewAnalysis} className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-cyan-600 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200">
                <ArrowPathIcon className="w-5 h-5" />
                New Analysis
              </button>
            </div>
        </div>
      </div>
    </>
  );
};