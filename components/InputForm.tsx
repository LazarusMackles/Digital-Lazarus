

import React, { useCallback } from 'react';
import { InputTabs } from './InputTabs';
import { FileUploadDisplay } from './FileUploadDisplay';
import { ModeSelector } from './ModeSelector';
import { ForensicModeToggle } from './ForensicModeToggle';
import { HowItWorks } from './HowItWorks';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import * as actions from '../context/actions';
import { Card } from './ui';
// FIX: The import path for icons was ambiguous. It is now explicitly pointing to the index file within the icons directory.
import { XMarkIcon } from './icons/index';

export const InputForm: React.FC = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: resultState, dispatch: resultDispatch } = useResultState();
    const { performAnalysis, handleClearInputs } = useAnalysisWorkflow();

    const {
        textContent,
        fileData,
        url,
        activeInput,
        analysisMode,
        forensicMode,
    } = inputState;
    const { error } = resultState;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        inputDispatch({ type: actions.SET_TEXT_CONTENT, payload: e.target.value });
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        inputDispatch({ type: actions.SET_URL, payload: e.target.value });
    };

    const handleAnalysisModeChange = useCallback((mode) => {
        inputDispatch({ type: actions.SET_ANALYSIS_MODE, payload: mode });
    }, [inputDispatch]);

    const handleForensicModeChange = useCallback((mode) => {
        inputDispatch({ type: actions.SET_FORENSIC_MODE, payload: mode });
    }, [inputDispatch]);

    const isInputValid = () => {
        switch (activeInput) {
            case 'text':
                return textContent.trim().length > 0;
            case 'file':
                return fileData.length > 0;
            case 'url':
                try {
                    // Basic URL validation
                    new URL(url);
                    return true;
                } catch (_) {
                    return false;
                }
            default:
                return false;
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInputValid()) {
            performAnalysis();
        } else {
             resultDispatch({ type: actions.ANALYSIS_ERROR, payload: 'Please provide valid input before starting the analysis.' });
        }
    };
    
    const hasInput = textContent.trim().length > 0 || fileData.length > 0 || url.trim().length > 0;

    const renderInput = () => {
        switch (activeInput) {
            case 'text':
                return (
                    <textarea
                        value={textContent}
                        onChange={handleTextChange}
                        placeholder="Paste the text you wish to analyze here. I'll examine its structure, style, and syntax to determine its origin..."
                        className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
                        aria-label="Text input for analysis"
                    />
                );
            case 'file':
                return <FileUploadDisplay />;
            case 'url':
                return (
                    <input
                        type="url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="https://example.com/article"
                        className="w-full p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
                        aria-label="URL input for analysis"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <HowItWorks />
            
            <Card>
                <form onSubmit={handleSubmit} id="input-area">
                    <InputTabs />
                    <div className="p-6 bg-white dark:bg-slate-800/80 rounded-b-lg border-x border-b border-slate-200 dark:border-slate-700/50">
                        {renderInput()}
                        {activeInput === 'file' && <ForensicModeToggle selectedMode={forensicMode} onModeChange={handleForensicModeChange} />}
                        <ModeSelector selectedMode={analysisMode} onModeChange={handleAnalysisModeChange} />

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400/50 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <button
                                type="submit"
                                disabled={!isInputValid()}
                                className="px-10 py-4 font-bold text-white bg-gradient-to-r from-cyan-600 to-fuchsia-600 rounded-full shadow-lg shadow-cyan-500/30 hover:from-cyan-500 hover:to-fuchsia-500 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                Begin Deduction
                            </button>
                            {hasInput && (
                                <div className="p-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500">
                                    <button
                                        type="button"
                                        onClick={handleClearInputs}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all duration-200"
                                    >
                                        <XMarkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Clear</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};