
import React from 'react';
import { ThemeToggle } from './ui';

export const Header: React.FC = React.memo(() => {
  return (
    <>
      <header className="relative text-center">
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <ThemeToggle />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500 pb-2">
          GenAI Sleuther Vanguard
        </h1>
      </header>
    </>
  );
});
