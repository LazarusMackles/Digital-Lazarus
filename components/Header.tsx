
import React, { useState } from 'react';
import { ThemeToggle, HistoryModal } from './ui';
import { useUIState } from '../context/UIStateContext';
import { useApiKeys } from '../hooks/useApiKeys';
import * as actions from '../context/actions';
import { Icon } from './icons/index';
import { cn } from '../utils/cn';

export const Header: React.FC = React.memo(() => {
  const { dispatch } = useUIState();
  const { hasGoogleApiKey } = useApiKeys();
  const [showHistory, setShowHistory] = useState(false);
  
  const handleOpenSettings = () => dispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: true });

  return (
    <>
      <header className="relative text-center">
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors duration-300"
            aria-label="View Case History"
            title="Case History"
          >
            <Icon name="clock" className="w-5 h-5" />
          </button>
          <button
            onClick={handleOpenSettings}
            className={cn(
                "p-2 rounded-full border transition-all duration-300 relative group",
                hasGoogleApiKey 
                    ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 animate-pulse"
            )}
            aria-label={hasGoogleApiKey ? "Settings (Keys Connected)" : "Settings (Keys Required)"}
            title={hasGoogleApiKey ? "System Ready: Keys Connected" : "Setup Required: Enter API Keys"}
          >
            <Icon name="key" className="w-5 h-5" />
            {hasGoogleApiKey && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
            )}
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 pb-2">
          GenAI Sleuther Vanguard
        </h1>
      </header>
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
    </>
  );
});