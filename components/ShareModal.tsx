import React, { useState, useMemo, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { XMarkIcon, ShareIcon } from './icons';

interface ShareModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const forensicReport = useMemo(() => {
    let report = `--- FORENSIC REPORT ---\n`;
    report += `Analysis by: Gen-AI Content Sleuth\n\n`;
    report += `VERDICT: ${result.verdict}\n`;
    report += `AI PROBABILITY: ${Math.round(result.probability)}%\n\n`;
    report += `EXPLANATION:\n${result.explanation}\n\n`;

    if (result.highlights && result.highlights.length > 0) {
      report += `--- KEY INDICATORS ---\n`;
      result.highlights.forEach((h, i) => {
        report += `${i + 1}. Indicator: "${h.text}"\n`;
        report += `   Reasoning: ${h.reason}\n\n`;
      });
    }
    return report;
  }, [result]);

  useEffect(() => {
    // Check for Web Share API support
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(forensicReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gen-AI Content Sleuth: Forensic Report',
          text: forensicReport,
        });
        onClose(); // Close modal on successful share
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay-fade-in" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up">
        <div className="p-6 sm:p-8">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close share dialog"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Share Forensic Report
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            Your detailed analysis is ready to be shared. Copy the report for pasting into documents, or use your device's native sharing options.
          </p>

          <div className="mt-4">
            <textarea
              readOnly
              value={forensicReport}
              className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors duration-300 resize-none text-xs font-mono"
              aria-label="Forensic report text"
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            {canShare && (
              <button
                onClick={handleWebShare}
                className="flex-1 sm:flex-none px-6 py-2 font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ShareIcon className="w-5 h-5" />
                Share via...
              </button>
            )}
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 sm:flex-none px-6 py-2 font-bold text-white bg-cyan-600 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {copied ? 'Report Copied!' : 'Copy Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
