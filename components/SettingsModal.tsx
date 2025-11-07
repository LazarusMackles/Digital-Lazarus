import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './icons/index';
import { Button } from './ui';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  useBodyScrollLock();

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    onClose();
    // Optional: Add a success notification
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    onClose();
  }

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
                aria-label="Close settings modal"
            >
                <Icon name="x-mark" className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                API Key Settings
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                To bypass the limitations of the shared testing environment, please provide your own Google AI Studio API key.
            </p>
            
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              className="mt-4 w-full p-3 font-mono bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Your key is saved securely in your browser's local storage. You can obtain a key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Google AI Studio</a>.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                    variant="clear"
                    onClick={handleClear}
                >
                    Clear Key
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!apiKey.trim()}
                >
                    Save & Close
                </Button>
            </div>
        </div>
      </div>
    </div>
  );

  if (!modalRoot) return null;
  return createPortal(modalContent, modalRoot);
};
