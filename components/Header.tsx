
import React from 'react';
import { ThemeToggle } from './ui';
import { useUIState } from '../context/UIStateContext';
import { useApiKeys } from '../hooks/useApiKeys';
import * as actions from '../context/actions';
import { Icon } from './icons/index';
import { cn } from '../utils/cn';

export const Header: React.FC = React.memo(() => {
  const { dispatch } = useUIState();
  const { hasGoogleApiKey } = useApiKeys();
  
  const handleOpenSettings = () => dispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: true });

  return (
    <header className="relative text-center mb-6">
      <div className="absolute top-0 right-0 flex items-center gap-1 z-10">
        <button
          onClick={handleOpenSettings}
          className={cn(
              "p-1.5 rounded-full border transition-all duration-300 relative group",
              hasGoogleApiKey 
                  ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 animate-pulse"
          )}
          aria-label={hasGoogleApiKey ? "Settings (Keys Connected)" : "Settings (Keys Required)"}
          title={hasGoogleApiKey ? "System Ready: Keys Connected" : "Setup Required: Enter API Keys"}
        >
          <Icon name="key" className="w-4 h-4 sm:w-5 sm:h-5" />
          {hasGoogleApiKey && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </span>
          )}
        </button>
        <ThemeToggle />
      </div>
      <div className="pt-1 px-0 w-full text-left sm:text-center">
          {/* Mobile: pr-20 ensures text wraps WAY before hitting icons. Text size reduced to 2xl. */}
          <h1 className="text-2xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 pb-2 leading-tight pr-20 sm:pr-0">
            Sleuther Vanguard
          </h1>
      </div>
    </header>
  );
});
