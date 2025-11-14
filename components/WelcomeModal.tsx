
import React from 'react';
import { Icon } from './icons/index';
import { Button } from './ui';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = React.memo(({ onClose }) => {
  useBodyScrollLock();
  
  return (
    // DEFINITIVE FIX:
    // The overlay is now a flex container. `justify-center` handles horizontal centering,
    // and `items-start` handles the vertical top alignment. Padding is added here to
    // create space from the screen edges. This is a more robust pattern than absolute positioning.
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start p-4 sm:p-6 md:p-8 overflow-y-auto modal-overlay-fade-in" 
      aria-modal="true" 
      role="dialog"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up">
        <div className="p-6 sm:p-8">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close welcome message"
            >
                <Icon name="x-mark" className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Your Mission Briefing
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
                Welcome, fellow detective! Before you begin your first case, a few notes from headquarters:
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                    <span className="text-cyan-500 font-bold mt-0.5">1.</span>
                    <div>
                        <span className="font-semibold text-slate-800 dark:text-white">Our Goal is Clarity, Not Judgement.</span> This tool is designed to uncover the 'Digital DNA' of content, revealing whether its origins are human, AI, or a collaboration of both.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-cyan-500 font-bold mt-0.5">2.</span>
                    <div>
                        <span className="font-semibold text-slate-800 dark:text-white">Deductions are Expert Opinions.</span> AI detection is a complex, evolving science. Consider my findings a well-informed probability, not the undisputed truth.
                    </div>
                </li>
                 <li className="flex items-start gap-3">
                    <span className="text-cyan-500 font-bold mt-0.5">3.</span>
                    <div>
                       <span className="font-semibold text-slate-800 dark:text-white">Choose Your Method.</span> You can perform a 'Forensic Analysis' on the image content or a 'Provenance Dossier' to investigate its history online. You are in control.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-cyan-500 font-bold mt-0.5">4.</span>
                    <div>
                       <span className="font-semibold text-slate-800 dark:text-white">Powered by Google's Gemini API.</span> This tool uses advanced generative models to perform its analysis. <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Learn more here</a>.
                    </div>
                </li>
            </ul>
            <div className="mt-6 flex justify-center">
                <Button
                    onClick={onClose}
                    className="px-6 py-2"
                >
                    The Game is Afoot!
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
});
