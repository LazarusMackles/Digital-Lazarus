
import React from 'react';

export const IntroPanel: React.FC = React.memo(() => (
    <div className="mt-4 max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <p className="text-lg text-slate-800 dark:text-slate-200">
            In this brave new world of collaboration between <span className="font-semibold text-cyan-600 dark:text-cyan-400">Humans</span> and <span className="font-semibold text-cyan-600 dark:text-cyan-400">Digital Entities</span>, clarity is key. Let's analyse images and text to trace their digital <span className="font-semibold text-cyan-600 dark:text-cyan-400">DNA</span> and see if they've been created or enhanced by AI.
        </p>
    </div>
));
