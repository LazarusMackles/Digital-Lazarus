import React from 'react';

export const SleuthNote: React.FC = React.memo(() => {
    return (
        <div className="mt-8 w-full max-w-xl bg-cyan-100 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-500/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">A Note from the Sleuth</h4>
            <p className="text-sm text-cyan-900/80 dark:text-slate-300 mt-1">
                My purpose is not to declare AI content 'good' or 'bad'—merely to bring clarity. The science of AI detection is complex and evolving, so consider my findings a well-informed probability, not an absolute truth. AI remains a powerful tool for creativity, and this app celebrates our collaborative future, where humans and AI work together to make our world a bit better. This analysis is powered by the <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 underline">Google Gemini API</a>.
            </p>
        </div>
    );
});
