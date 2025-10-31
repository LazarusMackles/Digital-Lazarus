

import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = React.memo(({ message = "Deducing the Digital DNA ... " }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <svg className="animate-spin h-12 w-12 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">{message}</h2>
      <p className="text-slate-500 dark:text-slate-400">The clues are revealing themselves. One moment while I consult my circuits.</p>
    </div>
  );
});
