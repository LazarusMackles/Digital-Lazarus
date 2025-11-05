import React from 'react';

export const SleuthNote: React.FC = React.memo(() => {
    return (
        <div className="mt-8 w-full max-w-xl bg-cyan-100 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-500/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">A Personal Note from Sleuther Vanguard ...</h4>
            <p className="text-sm text-cyan-900/80 dark:text-slate-300 mt-1">
                This tool is not for judging GenAI content as "good" or "bad." It is here to make things clear and easy to determine. Detecting GenAI content is an emerging and challenging science. Please think of these results as an expert guess, not a perfect fact. GenAI is very powerful tool but still subject to occasional errors. Our wee App celebrates our now-future where humans and Data work together to evoke inspiration and bring value.
            </p>
            <p className="text-sm text-cyan-900/80 dark:text-slate-300 mt-3">
                This analysis is powered by the <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 underline">Google Gemini API</a>.
            </p>
        </div>
    );
});