import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons/index';
import { Button } from './Button';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useApiKeys } from '../../hooks/useApiKeys';
import { useUIState } from '../../context/UIStateContext';
import * as actions from '../../context/actions';

export const ApiKeyOnboardingModal: React.FC = () => {
  const { saveSightengineApiKey } = useApiKeys();
  const { dispatch } = useUIState();
  const [localKey, setLocalKey] = useState('');
  
  useBodyScrollLock();

  const handleClose = () => {
    dispatch({ type: actions.SET_SHOW_API_KEY_ONBOARDING, payload: false });
  };
  
  const handleSave = () => {
    saveSightengineApiKey(localKey.trim());
    handleClose();
  };

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto modal-overlay-fade-in" 
      aria-modal="true" 
      role="dialog"
      onClick={handleClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up mt-8"
      >
        <div className="p-6 sm:p-8">
            <button 
                onClick={handleClose} 
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close"
            >
                <Icon name="x-mark" className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Unlock Hybrid Analysis
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                For the highest possible accuracy, Sleuther can cross-reference its findings with Sightengine, a specialized pixel-analysis tool. To enable this, you'll need a free API key from Sightengine.
            </p>
            
            <div className="mt-6 space-y-4 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                <a 
                    href="https://sightengine.com/signup" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-2 font-bold rounded-full text-white bg-gradient-to-r from-cyan-600 to-fuchsia-600 shadow-lg hover:from-cyan-500 hover:to-fuchsia-500"
                >
                    Get Your Free Sightengine Key
                </a>
                <ol className="text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside space-y-1">
                    <li>Click the button to sign up (opens a new tab).</li>
                    <li>Find your API User and API Secret on your dashboard.</li>
                    <li>Combine them in the format <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">USER:SECRET</code>.</li>
                    <li>Come back here and paste the combined key below.</li>
                </ol>
                <div>
                     <input
                        type="password"
                        id="sightengine-onboarding-key"
                        placeholder="user_id:secret_key"
                        value={localKey}
                        onChange={(e) => setLocalKey(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
                 <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Maybe Later
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!localKey.includes(':')}
                >
                    Save & Continue
                </Button>
            </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};