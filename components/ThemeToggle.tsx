import React from 'react';
import { SunIcon, MoonIcon } from './icons/index';
import { useResultState } from '../context/ResultStateContext';
import * as actions from '../context/actions';

export const ThemeToggle: React.FC = React.memo(() => {
  const { state, dispatch } = useResultState();
  const { theme } = state;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch({ type: actions.SET_THEME, payload: newTheme });
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );
});