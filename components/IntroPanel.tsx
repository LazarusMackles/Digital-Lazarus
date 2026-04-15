
import React from 'react';
import { useApiKeys } from '../hooks/useApiKeys';
import { Icon } from './icons/index';
import { cn } from '../utils/cn';

export const IntroPanel: React.FC = React.memo(() => {
    const { hasGoogleApiKey, hasHiveKeys } = useApiKeys();

    return (
        <div className="mt-2 sm:mt-4 max-w-3xl mx-auto bg-slate-100 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden">
            <div className="text-sm sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed text-center font-medium">
                <p>
                    Sleuther Vanguard combines <span className="text-cyan-600 dark:text-cyan-400 font-bold">pixel analysis</span> with <span className="text-cyan-600 dark:text-cyan-400 font-bold">cognitive AI</span> to verify image authenticity in seconds &mdash; all within your browser for total privacy.
                </p>
            </div>
        </div>
    );
});
