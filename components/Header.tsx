import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ theme, setTheme }) => {
  return (
    <header className="relative text-center">
      <div className="absolute top-0 right-0">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 pb-2">
        GenAI Sleuther Vanguard
      </h1>
      <div className="mt-4 max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <p className="text-lg text-slate-800 dark:text-slate-200">
          In this new age of brilliant collaboration between humans and AI, clarity is key. Together let's analyse text, images, and URLs to trace their digital origins and see if they've been enhanced by AI. Present your evidence below.
        </p>
      </div>
    </header>
  );
});