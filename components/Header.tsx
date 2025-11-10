import React from 'react';
import { ThemeToggle } from './ThemeToggle';

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
        <div className="mt-4 max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
          <p className="text-lg text-slate-800 dark:text-slate-200">
            In this brave new world of collaboration between <span className="font-semibold text-cyan-600 dark:text-cyan-400">Humans</span> and <span className="font-semibold text-cyan-600 dark:text-cyan-400">Digital Entities</span> - clarity is key. Let's analyse images and text to trace their digital <span className="font-semibold text-cyan-600 dark:text-cyan-400">DNA</span> and see if they've been created or enhanced by AI.
          </p>
        </div>
      </header>
    </>
  );
});