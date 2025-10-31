import React, { useState } from 'react';
import { ThumbsUpIcon, ThumbsDownIcon } from './icons';

export const Feedback: React.FC = () => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleFeedback = () => {
    setFeedbackGiven(true);
  };

  return (
    <div className="mt-6 text-sm">
      {feedbackGiven ? (
        <p className="text-cyan-600 dark:text-cyan-400">Merci! Your feedback helps sharpen my deductive skills.</p>
      ) : (
        <>
          <p className="text-slate-500 dark:text-slate-400 mb-2">Did my analysis help solve your case?</p>
          <div className="flex justify-center gap-4">
            <button onClick={handleFeedback} className="p-2 text-slate-500 hover:text-green-500 bg-slate-200 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-green-400 dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200" aria-label="Yes, this was helpful">
              <ThumbsUpIcon className="w-5 h-5" />
            </button>
            <button onClick={handleFeedback} className="p-2 text-slate-500 hover:text-red-500 bg-slate-200 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-red-400 dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200" aria-label="No, this was not helpful">
              <ThumbsDownIcon className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};