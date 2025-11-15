import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AnalysisResult, AnalysisEvidence, AnalysisAngle } from '../../types';
import { Icon } from '../icons/index';
import { generateShareText } from '../../utils/reportUtils';
import { Button } from './Button';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useResultState } from '../../context/ResultStateContext';

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const { state: resultState } = useResultState();
  const { analysisResult, analysisEvidence, analysisTimestamp, modelUsed, analysisAngleUsed } = resultState;
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  useBodyScrollLock();

  if (!analysisResult) return null;

  const shareText = generateShareText(analysisResult, analysisEvidence, analysisTimestamp, false, modelUsed, analysisAngleUsed);
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
                <Icon name="x-mark" className="w-6 h-6" />
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
                <Button
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                    onClick={() => window.location.href = `mailto:?subject=${reportTitle}&body=${encodedShareText}`}
                >
                    <Icon name="envelope" className="w-5 h-5" />
                    <span>Send via Email</span>
                </Button>
                <Button
                    onClick={handleCopy}
                    className="flex-1 sm:flex-none"
                >
                    {copyStatus === 'idle' ? 'Copy Report' : 'Copied!'}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );

  if (!modalRoot) {
    return null;
  }

  return createPortal(modalContent, modalRoot);
};
