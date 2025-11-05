import React, { useMemo } from 'react';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';

const URL_REGEX = /(https?:\/\/[^\s]+)/;

export const TextInputPanel: React.FC = () => {
    const { state, dispatch } = useInputState();
    const { textContent } = state;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: actions.SET_TEXT_CONTENT, payload: e.target.value });
    };

    const hasUrl = useMemo(() => URL_REGEX.test(textContent), [textContent]);

    const placeholderText = `Awaiting your text evidence...

⚠️ A quick heads-up: Please remove any URLs (http://...) from your text. 
My circuits can get tangled on web links in this prototype, and removing them ensures a speedy, accurate analysis.`;


    return (
        <div>
            <textarea
                value={textContent}
                onChange={handleTextChange}
                placeholder={placeholderText}
                className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400"
                aria-label="Text input for analysis"
            />
            {hasUrl && (
                <div className="mt-2 p-2 text-xs text-center bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 rounded-lg text-amber-800 dark:text-amber-300 animate-fade-in flex items-center justify-center">
                     <span role="img" aria-label="Warning emoji" className="mr-2 text-base">⚠️</span>
                     <div>
                        <span className="font-bold">Heads up!</span> A URL was detected. To prevent my circuits from getting stuck, please remove the link before proceeding with the deduction.
                     </div>
                </div>
            )}
        </div>
    );
};