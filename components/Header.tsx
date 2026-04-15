
import React from 'react';
import { ThemeToggle } from './ui';
import { useUIState } from '../context/UIStateContext';
import { useApiKeys } from '../hooks/useApiKeys';
import { useAppView } from '../hooks/useAppView';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import * as actions from '../context/actions';
import { Icon } from './icons/index';
import { cn } from '../utils/cn';

export const Header: React.FC = React.memo(() => {
  const { dispatch } = useUIState();
  const { hasGoogleApiKey, hasHiveKeys } = useApiKeys();
  const view = useAppView();
  const { handleReset } = useAnalysisWorkflow();
  const isSystemReady = hasGoogleApiKey && hasHiveKeys;
  
  const handleOpenSettings = () => dispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: true });

  const showHome = view !== 'INPUT';

  return (
    <header className="w-full mb-6 flex items-center justify-center min-h-[3rem]">
      
      <div className="flex flex-row items-center justify-center gap-2 sm:gap-6">
          
          {showHome && (
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all duration-300 group"
              aria-label="Back to Home"
              title="Back to Home"
            >
              <Icon name="home" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            </button>
          )}

          <h1 className="py-2 text-base sm:text-lg md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 leading-tight tracking-tight truncate max-w-[120px] xs:max-w-none xs:whitespace-nowrap">
            Sleuther Vanguard
          </h1>

          {/* Icons Group: Tightly coupled to the title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleOpenSettings}
              className={cn(
                  "p-1.5 sm:p-2 rounded-full border transition-all duration-300 group",
                  isSystemReady 
                      ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400"
              )}
              aria-label={isSystemReady ? "Settings (System Online)" : "Settings (Sensors Offline)"}
              title={isSystemReady ? "System Ready: Sensors Online" : "Setup Required: Connect Sensors"}
            >
              <Icon name="cog" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <ThemeToggle />
          </div>

      </div>
    </header>
  );
});
