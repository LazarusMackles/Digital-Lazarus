
import React from 'react';

export const IntroPanel: React.FC = React.memo(() => (
    <div className="mt-2 sm:mt-4 max-w-3xl mx-auto bg-slate-100 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/10 dark:bg-cyan-400/10 border-b border-l border-cyan-500/20 dark:border-cyan-400/20 rounded-bl-lg flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Security Hardened</span>
        </div>
        <div className="text-sm sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed text-center font-medium pt-2">
            <p>
                Sleuther Vanguard is a professional forensic tool that harmonises <span className="text-cyan-600 dark:text-cyan-400 font-bold">mathematical pixel analysis</span> with <span className="text-cyan-600 dark:text-cyan-400 font-bold">cognitive AI</span>. Operating entirely within your browser for maximum privacy, it acts as an automated detective to verify image authenticity in seconds.
            </p>
        </div>
    </div>
));