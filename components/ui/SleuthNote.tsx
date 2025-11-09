
import React from 'react';

interface SleuthNoteProps {
  children: React.ReactNode;
}

export const SleuthNote: React.FC<SleuthNoteProps> = ({ children }) => {
  return (
    <div className="w-full max-w-xl text-center bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <h4 className="font-bold text-cyan-600 dark:text-cyan-400">Sleuther's Note</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{children}</p>
    </div>
  );
};
