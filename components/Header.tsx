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
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">
        Gen-AI Content Sleuth
      </h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
        In this new age of brilliant collaboration between humans and AI, clarity is key. Let's analyse text, images, and URLs to trace their digital origins and see if they've been enhanced by AI. Present your evidence below.
      </p>
    </header>
  );
});