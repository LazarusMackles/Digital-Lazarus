
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
  const { googleApiKey, sightengineApiKey, saveGoogleApiKey, saveSightengineApiKey, clearKeys } = useApiKeys();
  const [localGoogleKey, setLocalGoogleKey] = useState(googleApiKey || '');
  const [localSightengineKey, setLocalSightengineKey] = useState(sightengineApiKey || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useBodyScrollLock();
  
  const handleSave = () => {
    saveGoogleApiKey(localGoogleKey.trim());
    saveSightengineApiKey(localSightengineKey.trim());
    setSaveStatus('saved');
    
    // Wait for a "beat" (1000ms) to let the user see the success state, then auto-close.
    setTimeout(() => {
        setSaveStatus('idle');
        onClose();
    }, 1000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your stored API keys? This will remove them from your browser\'s local storage.')) {
        clearKeys();
        setLocalGoogleKey('');
        setLocalSightengineKey('');
    }
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
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up mt-8 mb-8"
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
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1 sm:flex-none border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    Clear Keys
                </Button>
                <Button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none"
                >
                    {saveStatus === 'idle' ? 'Save Keys' : 'Saved!'}
                </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon name="information-circle" className="w-4 h-4 text-cyan-500" />
                    Security Best Practices
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex gap-2">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span><strong>API Restrictions:</strong> Limit your keys to specific APIs (e.g., Gemini API) in the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Google Cloud Console</a>.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span><strong>Environmental Restrictions:</strong> Restrict keys to this application's domain to prevent unauthorized use.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span><strong>Key Rotation:</strong> Decommission and rotate keys every 90 days to minimize risk.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span><strong>Zero-Code Storage:</strong> Never commit these keys to version control or public repositories.</span>
                    </li>
                </ul>
            </div>

             <p className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                Your keys are stored locally in your browser and are only used to authenticate requests to Google and Sightengine.
             </p>
        </div>
      </div>
    </div>,
    modalRoot
  );
};
