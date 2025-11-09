
import React from 'react';
import { Icon } from './icons/index';

interface SleuthNoteProps {
  children: React.ReactNode;
}

export const SleuthNote: React.FC<SleuthNoteProps> = ({ children }) => {
  return (
    <div className="mt-6 w-full max-w-xl text-center flex items-start gap-3 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <Icon name="light-bulb" className="w-8 h-8 text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-1" />
      <div className="text-left">
        <h4 className="font-bold text-cyan-600 dark:text-cyan-400">Sleuther's Note</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">{children}</p>
      </div>
    </div>
  );
};
