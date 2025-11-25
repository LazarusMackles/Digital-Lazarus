
import React from 'react';

export const IntroPanel: React.FC = React.memo(() => (
    <div className="mt-2 sm:mt-4 max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <p className="text-sm sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
            In this <span className="font-bold text-cyan-600 dark:text-cyan-400">Brave New World</span> of collaboration between <span className="font-semibold text-cyan-600 dark:text-cyan-400">Humans</span> and <span className="font-semibold text-cyan-600 dark:text-cyan-400">Digital Entities</span>, clarity is key. Let's analyse images to trace their digital <span className="font-semibold text-cyan-600 dark:text-cyan-400">DNA</span> and see if they're <span className="font-bold text-cyan-600 dark:text-cyan-400">Created</span> or <span className="font-bold text-cyan-600 dark:text-cyan-400">Enhanced</span> with AI.
        </p>
    </div>
));
