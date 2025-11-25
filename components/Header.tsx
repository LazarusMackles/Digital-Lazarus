
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
    <header className="w-full mb-6 flex items-center justify-center min-h-[3rem]">
      
      {/* Flex Cluster: Title and Icons sit together as a single unit */}
      <div className="flex items-center justify-center gap-3 sm:gap-6">
          
          {/* Title: Single line, larger on mobile to compete with icons */}
          <h1 className="text-2xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 leading-tight whitespace-nowrap tracking-tight">
            Sleuther Vanguard
          </h1>

          {/* Icons Group: Tightly packed, scaled down on mobile */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={handleOpenSettings}
              className={cn(
                  "p-1.5 sm:p-2 rounded-full border transition-all duration-300 group",
                  hasGoogleApiKey 
                      ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400"
              )}
              aria-label={hasGoogleApiKey ? "Settings (Keys Connected)" : "Settings (Keys Required)"}
              title={hasGoogleApiKey ? "System Ready: Keys Connected" : "Setup Required: Enter API Keys"}
            >
              <Icon name="key" className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <ThemeToggle />
          </div>

      </div>
    </header>
  );
});
