import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from '../types';
import { XMarkIcon, ShareIcon } from './icons';

interface ShareModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ result, onClose }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const generateShareText = useCallback(() => {
    let text = `--- FORENSIC REPORT ---\n`;
    text += `Analysis by: GenAI Sleuther Vanguard\n\n`;
    text += `VERDICT: ${result.verdict}\n`;
    text += `AI PROBABILITY: ${Math.round(result.probability)}%\n\n`;
    text += `EXPLANATION:\n${result.explanation}\n\n`;
    
    if (result.highlights && result.highlights.length > 0) {
      text += 'KEY INDICATORS:\n';
      result.highlights.forEach(h => {
        text += `- "${h.text}": ${h.reason}\n`;
      });
      text += '\n';
    }

    text += 'Analysis performed by GenAI Sleuther Vanguard, powered by Google Gemini.';
    return text;
  }, [result]);

  const shareText = generateShareText();

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [shareText]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GenAI Sleuther Vanguard Forensic Report',
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing analysis:', error);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API.
      handleCopy();
    }
  }, [shareText, handleCopy]);


  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay-fade-in" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up">
        <div className="p-6 sm:p-8">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close share modal"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Share Forensic Report
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                Your detailed analysis is ready to be shared. Copy the report for pasting into documents, or use your device's native sharing options.
            </p>
            
            <textarea
              readOnly
              value={shareText}
              className="mt-4 w-full h-48 p-3 font-mono bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
            />

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                    onClick={handleShare}
                    className="flex-1 sm:flex-none px-6 py-3 font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <ShareIcon className="w-5 h-5" />
                    <span>Share via ...</span>
                </button>
                <button
                    onClick={handleCopy}
                    className="flex-1 sm:flex-none px-6 py-3 font-bold text-white bg-cyan-600 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    {copyStatus === 'idle' ? 'Copy Report' : 'Copied!'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};