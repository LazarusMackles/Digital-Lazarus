import React, { useRef } from 'react';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';
// FIX: Corrected import path to point to the 'icons' directory's index file, resolving module ambiguity.
import { Icon } from './icons/index';
import { cn } from '../utils/cn';

export const TextInputPanel: React.FC = () => {
    const { state, dispatch } = useInputState();
    const { textContent } = state;
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
            className={cn(
                "relative p-4 border-2 border-dashed rounded-lg transition-colors h-[180px] bg-slate-100 dark:bg-slate-900 cursor-text",
                "focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/50 dark:focus-within:ring-cyan-400/50",
                'border-slate-300 dark:border-slate-600'
            )}
        >
            {/* Custom Placeholder */}
            {textContent.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center pointer-events-none">
                    <Icon name="text" className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">Paste your text here,</span> or start typing.
                    </p>
                </div>
            )}
            
            <textarea
                ref={textAreaRef}
                id="text-input"
                value={textContent}
                onChange={handleTextChange}
                className="absolute inset-0 w-full h-full p-4 bg-transparent rounded-lg border-0 focus:outline-none text-slate-800 dark:text-slate-200 resize-none"
            />
        </div>
    );
};