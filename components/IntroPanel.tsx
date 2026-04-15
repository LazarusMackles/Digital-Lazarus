
import React from 'react';
import { useApiKeys } from '../hooks/useApiKeys';
import { Icon } from './icons/index';

export const IntroPanel: React.FC = React.memo(() => {
    const { hasGoogleApiKey, hasHiveKeys } = useApiKeys();

    return (
        <div className="mt-2 sm:mt-4 max-w-3xl mx-auto bg-slate-100 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden">
            <div className="text-sm sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed text-center font-medium mb-6">
                <p>
                    Sleuther Vanguard combines <span className="text-cyan-600 dark:text-cyan-400 font-bold">pixel analysis</span> with <span className="text-cyan-600 dark:text-cyan-400 font-bold">cognitive AI</span> to verify image authenticity in seconds &mdash; all within your browser for total privacy.
                </p>
            </div>

            {/* System Health Dashboard */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 border-t border-slate-200 dark:border-slate-700 pt-5">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasGoogleApiKey ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Neural Core</span>
                    {hasGoogleApiKey && <Icon name="thumbs-up" className="w-3 h-3 text-cyan-500" />}
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasHiveKeys ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Forensic Sensors</span>
                    {hasHiveKeys && <Icon name="thumbs-up" className="w-3 h-3 text-fuchsia-500" />}
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${(hasGoogleApiKey && hasHiveKeys) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Ready</span>
                </div>
            </div>
        </div>
    );
});
