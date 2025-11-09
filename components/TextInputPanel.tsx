import React, { useState, useRef } from 'react';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';
import { Icon } from './icons/index';

export const TextInputPanel: React.FC = () => {
    const { state, dispatch } = useInputState();
    const { textContent } = state;
    const [isFocused, setIsFocused] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: actions.SET_TEXT_CONTENT, payload: e.target.value });
    };

    const handleContainerClick = () => {
        textAreaRef.current?.focus();
    };

    return (
        <div 
            onClick={handleContainerClick}
            className="relative w-full h-48 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-cyan-500 transition-all cursor-text"
        >
            {!textContent && !isFocused && (
                <div 
                    className="absolute inset-0 flex flex-col items-center text-center p-4 pt-3 text-slate-500 dark:text-slate-400 pointer-events-none"
                    aria-hidden="true"
                >
                    <Icon name="text" className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Awaiting to deduce the evidence ...
                        <span className="block font-semibold text-cyan-600 dark:text-cyan-400 mt-1">
                            Paste your text here.
                        </span>
                    </p>
                </div>
            )}
            <textarea
                ref={textAreaRef}
                value={textContent}
                onChange={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="relative z-10 w-full h-full px-4 py-3 bg-transparent rounded-lg resize-none focus:outline-none text-slate-800 dark:text-slate-200"
                aria-label="Text input for analysis"
            />
        </div>
    );
};