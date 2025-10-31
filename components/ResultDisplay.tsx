import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { ShareIcon, ArrowPathIcon } from './icons';
import { ShareModal } from './ShareModal';
import { RadialProgress } from './RadialProgress';
import { Loader } from './Loader';
import { Feedback } from './Feedback';
import { SleuthNote } from './SleuthNote';

interface ResultDisplayProps {
  result: AnalysisResult;
  onChallengeVerdict?: () => void;
  isChallenged: boolean;
  onNewAnalysis: () => void;
  isLoading: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onChallengeVerdict, isChallenged, onNewAnalysis, isLoading }) => {
  const hasHighlights = result.highlights && result.highlights.length > 0;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const showChallengeButton = onChallengeVerdict && !isChallenged && result.probability < 50;

  return (
    <>
      {isShareModalOpen && <ShareModal result={result} onClose={() => setIsShareModalOpen(false)} />}
      <div className="relative">
        <button 
          onClick={onNewAnalysis} 
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
            
            {hasHighlights && (
              <div className="mt-8 w-full max-w-xl text-left">
                <h3 className="text-lg font-semibold text-center text-cyan-600 dark:text-cyan-400 mb-4">
                  Key Indicators Found
                </h3>
                <div className="space-y-4">
                  {result.highlights?.map((highlight, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <blockquote className="border-l-4 border-cyan-500 pl-4">
                        <p className="font-mono text-sm text-slate-800 dark:text-white italic">"{highlight.text}"</p>
                      </blockquote>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{highlight.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showChallengeButton && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl flex flex-col items-center">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Think I've missed something?</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Let's solve this case together.</p>
                    <button
                        onClick={onChallengeVerdict}
                        className="px-6 py-2 font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Challenge the Verdict &amp; Look Closer 🔬
                    </button>
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
              <button onClick={onNewAnalysis} className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-cyan-600 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200">
                <ArrowPathIcon className="w-5 h-5" />
                New Analysis
              </button>
            </div>
        </div>
      </div>
    </>
  );
};