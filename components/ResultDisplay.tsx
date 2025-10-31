import React, { useState } from 'react';
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
    handleNewAnalysis, 
    isLoading 
  } = useAnalysis();
    
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  if (!result) return null;

  const hasHighlights = result.highlights && result.highlights.length > 0;
  const showChallengeSection = !result.isSecondOpinion;

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
            
            {result.isSecondOpinion && (
                <p className="mt-6 font-semibold text-cyan-600 dark:text-cyan-400">Second Opinion</p>
            )}
            <h2 className={`text-3xl font-bold ${result.isSecondOpinion ? 'mt-1' : 'mt-6'}`}>{result.verdict}</h2>

            <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-xl">{result.explanation}</p>
            
            {hasHighlights && <HighlightsDisplay highlights={result.highlights!} />}
            
            {showChallengeSection && (
              <div className="mt-8 pt-6 border-t border-fuchsia-400/30 dark:border-fuchsia-500/30 w-full max-w-xl">
                <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                    <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Challenge the Verdict & Look Closer</h3>
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-1 mb-5">
                        My deduction may be flawed. Guide my re-analysis by choosing a forensic angle below.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <ModeButton
                            active={false}
                            onClick={() => handleChallenge('technical')}
                            title="Focus on Technical Clues"
                            description="Analyse pixels, lighting, and textures."
                            size="sm"
                            titleStyle="gradient"
                        />
                        <ModeButton
                            active={false}
                            onClick={() => handleChallenge('conceptual')}
                            title="Focus on Conceptual Clues"
                            description="Analyse context, subject, and overall 'feel'."
                            size="sm"
                            titleStyle="gradient"
                        />
                    </div>
                </div>
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
        </div>
      </div>
    </>
  );
};
