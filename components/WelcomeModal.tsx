import React from 'react';
import { Icon } from './icons/index';
import { Button } from './ui';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useUIState } from '../context/UIStateContext';
import * as actions from '../context/actions';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = React.memo(({ onClose }) => {
  useBodyScrollLock();
  const { dispatch } = useUIState();

  const handleOpenSettings = () => {
    onClose();
    dispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: true });
  }
  
  return (
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
                Welcome, detective! Sleuther Vanguard is a powerful image forensics tool. Before you begin your first case:
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                    <span className="text-cyan-500 font-bold mt-0.5">1.</span>
                    <div>
                        <span className="font-semibold text-slate-800 dark:text-white">API Keys Required.</span> This tool is powered by large AI models and requires your own API keys to function. You can enter them in the Settings panel.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-cyan-500 font-bold mt-0.5">2.</span>
                    <div>
                       <span className="font-semibold text-slate-800 dark:text-white">Choose Your Method.</span> Perform a 'Forensic Analysis' on image content, a 'Provenance Dossier' to investigate its web history, or a 'Hybrid Analysis' for maximum accuracy.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-cyan-500 font-bold mt-0.5">3.</span>
                    <div>
                       <span className="font-semibold text-slate-800 dark:text-white">Deductions are Expert Opinions.</span> AI detection is a complex, evolving science. Consider my findings a well-informed probability, not the undisputed truth.
                    </div>
                </li>
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                 <Button
                    onClick={handleOpenSettings}
                    variant="secondary"
                    className="px-6 py-2"
                >
                    Go to Settings
                </Button>
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