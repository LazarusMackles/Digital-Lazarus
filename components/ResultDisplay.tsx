import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';

interface RadialProgressProps {
    progress: number;
}

const RadialProgress: React.FC<RadialProgressProps> = ({ progress }) => {
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getColor = (p: number) => {
        if (p < 40) return '#2dd4bf'; // teal-400
        if (p < 75) return '#facc15'; // yellow-400
        return '#f43f5e'; // rose-500
    };
    
    const color = getColor(progress);

    return (
        <div className="relative w-48 h-48">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                <circle
                    className="stroke-slate-200 dark:stroke-slate-700"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, strokeLinecap: 'round' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color }}>{Math.round(progress)}%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">AI Probability</span>
            </div>
        </div>
    );
};

interface ResultDisplayProps {
  result: AnalysisResult;
  onChallengeVerdict?: () => void;
  isChallenged: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onChallengeVerdict, isChallenged }) => {
  const hasHighlights = result.highlights && result.highlights.length > 0;
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  const showChallengeButton = onChallengeVerdict && !isChallenged && result.probability < 50;

  const handleShare = () => {
    const shareText = `My Gen-AI Content Sleuth just deduced a ${Math.round(result.probability)}% AI probability! Verdict: "${result.verdict}". What will you discover?`;
      
    navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFeedback = () => {
    setFeedbackGiven(true);
  }

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
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
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full transition-all duration-200 text-sm"
          >
            <ShareIcon className="w-4 h-4" />
            <span>{copied ? 'Copied to Clipboard!' : 'Share the Verdict'}</span>
          </button>

          <div className="mt-6 text-sm">
            {feedbackGiven ? (
              <p className="text-cyan-600 dark:text-cyan-400">Merci! Your feedback helps sharpen my deductive skills.</p>
            ) : (
              <>
                <p className="text-slate-500 dark:text-slate-400 mb-2">Did my analysis help solve your case?</p>
                <div className="flex justify-center gap-4">
                  <button onClick={handleFeedback} className="p-2 text-slate-500 hover:text-green-500 bg-slate-200 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-green-400 dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200" aria-label="Yes, this was helpful">
                    <ThumbsUpIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleFeedback} className="p-2 text-slate-500 hover:text-red-500 bg-slate-200 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-red-400 dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200" aria-label="No, this was not helpful">
                    <ThumbsDownIcon className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 w-full max-w-xl bg-cyan-100 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-500/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">A Note from the Sleuth</h4>
            <p className="text-sm text-cyan-900/80 dark:text-slate-300 mt-1">My purpose is not to declare AI content "good" or "bad"—merely to bring clarity. AI is a powerful tool for creativity and saves our most precious resource: time. This app celebrates our collaborative future, where we work together to make our world a bit better.</p>
        </div>
    </div>
  );
};