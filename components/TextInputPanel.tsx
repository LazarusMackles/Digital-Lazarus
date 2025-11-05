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
        <textarea
            value={textContent}
            onChange={handleTextChange}
            placeholder="Paste the text you wish to analyze here. I'll examine its structure, style, and syntax to determine its origin..."
            className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
            aria-label="Text input for analysis"
        />
    );
};
