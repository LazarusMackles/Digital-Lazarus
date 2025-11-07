import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { SettingsModal } from './SettingsModal';
import { Icon } from './icons/index';

export const Header: React.FC = React.memo(() => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <header className="relative text-center">
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
            aria-label="Open settings"
          >
            <Icon name="settings" className="w-5 h-5" />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 pb-2">
          GenAI Sleuther Vanguard
        </h1>
        <div className="mt-4 max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
          <p className="text-lg text-slate-800 dark:text-slate-200">
            In this brave new world of collaboration between humans and LLMs - clarity is key. Together let's analyse images and text to trace their digital DNA and see if they've been created or enhanced by AI.
          </p>
        </div>
      </header>
    </>
  );
});
