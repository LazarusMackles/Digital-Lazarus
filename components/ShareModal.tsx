import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AnalysisResult, AnalysisEvidence } from '../types';
import { XMarkIcon, EnvelopeIcon } from './icons';
import { generateShareText } from '../utils/reportUtils';

interface ShareModalProps {
  result: AnalysisResult;
  onClose: () => void;
  evidence: AnalysisEvidence | null;
  timestamp: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ result, onClose, evidence, timestamp }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  // On the client, find the portal root to render into.
  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  // Effect to lock body scroll when modal is open for better UX on long pages.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleanup on unmount.

  const shareText = generateShareText(result, evidence, timestamp, false);
  const encodedShareText = encodeURIComponent(shareText);
  const reportTitle = encodeURIComponent('GenAI Sleuther Vanguard Forensic Report');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [shareText]);

  const modalContent = (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto modal-overlay-fade-in" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up mt-8"
      >
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
            
            <textarea
              readOnly
              value={shareText}
              className="mt-4 w-full h-40 p-3 font-mono bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
            />

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
                <a
                    href={`mailto:?subject=${reportTitle}&body=${encodedShareText}`}
                    className="flex-1 sm:flex-none px-6 py-3 font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <EnvelopeIcon className="w-5 h-5" />
                    <span>Send via Email</span>
                </a>
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

  // Only render the portal if the modalRoot element is available on the client.
  if (!modalRoot) {
    return null;
  }

  return createPortal(modalContent, modalRoot);
};