import React from 'react';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';

export const UrlInputPanel: React.FC = () => {
    const { state, dispatch } = useInputState();
    const { url } = state;

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: actions.SET_URL, payload: e.target.value });
    };

    return (
        <div className="relative">
             <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com/article"
                className="w-full p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
                aria-label="URL input for analysis"
            />
        </div>
    );
};