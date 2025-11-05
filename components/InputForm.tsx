import React, { useCallback, useMemo } from 'react';
import type { AnalysisMode, ForensicMode } from '../types';
import { InputTabs } from './InputTabs';
import { FileUploadDisplay } from './FileUploadDisplay';
import { ModeSelector } from './ModeSelector';
import { ForensicModeToggle } from './ForensicModeToggle';
import { HowItWorks } from './HowItWorks';
import { XMarkIcon } from './icons/index';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import * as actions from '../context/actions';

export const InputForm: React.FC = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: resultState } = useResultState();
    const { performAnalysis, handleClearInputs } = useAnalysisWorkflow();

    const { 
        activeInput, 
        textContent, 
        url, 
        fileData, 
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

    const handleModeChange = (mode: AnalysisMode) => {
        inputDispatch({ type: actions.SET_ANALYSIS_MODE, payload: mode });
    };
    
    const handleForensicModeChange = (mode: ForensicMode) => {
        inputDispatch({ type: actions.SET_FORENSIC_MODE, payload: mode });
    };

    const isSubmissionDisabled = useMemo(() => {
        switch(activeInput) {
            case 'text': return !textContent.trim();
            case 'file': return fileData.length === 0;
            case 'url': 
              try {
                // Basic check for a valid URL structure.
                new URL(url);
                return !url.trim();
              } catch (_) {
                return true;
              }
            default: return true;
        }
    }, [activeInput, textContent, fileData, url]);
    
    const handleSubmit = useCallback(() => {
        if (isSubmissionDisabled) return;
        performAnalysis();
    }, [isSubmissionDisabled, performAnalysis]);
    
    const renderInput = () => {
        switch (activeInput) {
            case 'text':
                return (
                    <textarea
                        value={textContent}
                        onChange={handleTextChange}
                        placeholder="Paste text here to begin your investigation..."
                        className="w-full h-48 p-4 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
                    />
                );
            case 'file':
                return <FileUploadDisplay />;
            case 'url':
                 let isValidUrl = true;
                if(url) {
                    try {
                        new URL(url);
                    } catch (_) {
                        isValidUrl = false;
                    }
                }
                return (
                    <div>
                        <input
                            type="url"
                            value={url}
                            onChange={handleUrlChange}
                            placeholder="https://example.com/article"
                            className={`w-full p-4 bg-white dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:outline-none text-slate-800 dark:text-slate-200 ${
                                !isValidUrl && url ? 'border-red-500 ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-cyan-500'
                            }`}
                        />
                        {!isValidUrl && url && <p className="text-red-500 text-sm mt-1">Please enter a valid URL.</p>}
                    </div>
                );
            default:
                return null;
        }
    };
    
    const showClearButton = textContent.length > 0 || fileData.length > 0 || url.length > 0;

    return (
      <div className="animate-fade-in-up" id="input-area">
        <HowItWorks />
        <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
          <InputTabs />
          <div className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-b-lg">
            {renderInput()}
            {activeInput === 'file' && <ForensicModeToggle selectedMode={forensicMode} onModeChange={handleForensicModeChange} />}
            <ModeSelector selectedMode={analysisMode} onModeChange={handleModeChange} />

            {error && (
                <div className="my-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center">
                    <p className="font-bold">An Error Occurred</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="mt-6 flex justify-center items-center gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmissionDisabled}
                    className="flex items-center justify-center gap-2 px-10 py-4 font-bold text-white bg-gradient-to-r from-cyan-600 to-fuchsia-600 rounded-full shadow-lg shadow-cyan-500/30 hover:from-cyan-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none"
                >
                    <span>Begin Deduction</span>
                </button>
                {showClearButton && (
                     <button
                        onClick={handleClearInputs}
                        className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transform hover:-translate-y-0.5 transition-all duration-200"
                        title="Clear all inputs"
                    >
                        <XMarkIcon className="w-5 h-5" />
                        <span>Clear</span>
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>
    );
};