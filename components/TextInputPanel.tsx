import React from 'react';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';

export const TextInputPanel: React.FC = () => {
    const { state, dispatch } = useInputState();
    const { textContent } = state;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: actions.SET_TEXT_CONTENT, payload: e.target.value });
    };

    return (
        // This div now acts as the styled container, applying focus rings when the textarea inside is focused.
        <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
            {/* The custom styled placeholder, visible only when textContent is empty */}
            {!textContent && (
                <div 
                    className="absolute top-0 left-0 p-4 text-slate-500 dark:text-slate-400 pointer-events-none"
                    aria-hidden="true"
                >
                    Awaiting your text evidence ...{' '}
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        Paste your text here.
                    </span>
                </div>
            )}
            <textarea
                value={textContent}
                onChange={handleTextChange}
                // Textarea is now transparent and fills the container. Outline is removed to use the parent's ring.
                className="relative z-10 w-full h-full p-4 bg-transparent rounded-lg resize-none focus:outline-none text-slate-800 dark:text-slate-200"
                aria-label="Text input for analysis"
            />
        </div>
    );
};