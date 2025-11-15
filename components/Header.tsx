
import React from 'react';
import { ThemeToggle } from './ui';
import { useUIState } from '../context/UIStateContext';
import * as actions from '../context/actions';
// FIX: Corrected import path for Icon component to point to the icons directory's index file.
import { Icon } from './icons/index';

export const Header: React.FC = React.memo(() => {
  const { dispatch } = useUIState();
  const handleOpenSettings = () => dispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: true });

  return (
    <>
      <header className="relative text-center">
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <button
            onClick={handleOpenSettings}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
            aria-label="Open settings"
            title="Settings"
          >
            <Icon name="key" className="w-5 h-5" />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 pb-2">
          GenAI Sleuther Vanguard
        </h1>
      </header>
    </>
  );
});
