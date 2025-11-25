
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
      
      {/* Responsive Layout: Column on Mobile (Stacked), Row on Desktop (Side-by-Side) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          
          {/* Title: 
              - Py-2 added to prevent 'g' descender truncation in bg-clip-text 
              - Text-4xl on mobile (Stacked allows big text)
              - Text-5xl on desktop
          */}
          <h1 className="py-2 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 leading-tight tracking-tight text-center">
            Sleuther Vanguard
          </h1>

          {/* Icons Group: Centered below title on mobile, side-by-side on desktop */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenSettings}
              className={cn(
                  "p-2 rounded-full border transition-all duration-300 group",
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
