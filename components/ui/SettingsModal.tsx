

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons/index';
import { Button } from './Button';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useApiKeys } from '../../hooks/useApiKeys';
import { cn } from '../../utils/cn';

interface SettingsModalProps {
  onClose: () => void;
}

const ApiKeyInput: React.FC<{
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isPassword?: boolean;
}> = ({ id, label, placeholder, value, onChange, isPassword = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input
            type={isPassword ? "password" : "text"}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { googleApiKey, sightengineApiKey, saveGoogleApiKey, saveSightengineApiKey } = useApiKeys();
  const [localGoogleKey, setLocalGoogleKey] = useState(googleApiKey || '');
  const [localSightengineKey, setLocalSightengineKey] = useState(sightengineApiKey || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useBodyScrollLock();
  
  const handleSave = () => {
    saveGoogleApiKey(localGoogleKey.trim());
    saveSightengineApiKey(localSightengineKey.trim());
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto modal-overlay-fade-in" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up mt-8"
      >
        <div className="p-6 sm:p-8">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close settings"
            >
                <Icon name="x-mark" className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Connection Settings
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Manage the API keys required to power Sleuther's analysis.
            </p>
            
            <div className="mt-6 space-y-4">
                <ApiKeyInput
                    id="google-api-key"
                    label="Google API Key"
                    placeholder="Enter your Google API Key"
                    value={localGoogleKey}
                    onChange={(e) => setLocalGoogleKey(e.target.value)}
                />
                 <ApiKeyInput
                    id="sightengine-api-key"
                    label="Sightengine API Key (Optional)"
                    placeholder="user_id:secret_key"
                    value={localSightengineKey}
                    onChange={(e) => setLocalSightengineKey(e.target.value)}
                />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none"
                >
                    {saveStatus === 'idle' ? 'Save Keys' : 'Saved!'}
                </Button>
            </div>
             <p className="mt-4 text-xs text-slate-500 dark:text-slate-500 text-center">
                Your keys are stored securely in your browser's local storage and are never sent to our servers.
             </p>
        </div>
      </div>
    </div>,
    modalRoot
  );
};
