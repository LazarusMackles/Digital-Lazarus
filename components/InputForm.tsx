import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { InputTabs } from './InputTabs';
import { FileUploadDisplay } from './FileUploadDisplay';
import { ModeSelector } from './ModeSelector';
import { HowItWorks } from './HowItWorks';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import * as actions from '../context/actions';
import { Card, Button } from './ui';
import { Icon } from './icons/index';
import { TextInputPanel } from './TextInputPanel';
import { isInputReadyForAnalysis } from '../utils/validation';
import { ForensicModeToggle } from './ForensicModeToggle';
import type { AnalysisMode, ForensicMode } from '../types';

// FIX: Moved the AIStudio interface into the declare global block to fix a scope issue.
// Define the AIStudio interface to provide type safety for the global window object.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

export const InputForm: React.FC = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: resultState, dispatch: resultDispatch } = useResultState();
    const { performAnalysis, handleClearInputs } = useAnalysisWorkflow();

    const [hasApiKey, setHasApiKey] = useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

    const {
        textContent,
        fileData,
        activeInput,
        analysisMode,
        forensicMode,
    } = inputState;
    const { error, isLoading } = resultState;

    useEffect(() => {
        const checkKey = async () => {
            setIsCheckingApiKey(true);
            if (window.aistudio) {
                try {
                    const keyStatus = await window.aistudio.hasSelectedApiKey();
                    setHasApiKey(keyStatus);
                } catch (e) {
                    console.error("Error checking for API key:", e);
                    setHasApiKey(false);
                }
            }
            setIsCheckingApiKey(false);
        };
        checkKey();
    }, [isLoading]); // Re-check when an analysis starts/finishes

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Optimistically update UI assuming the user selects a key.
            // The useEffect will re-verify on the next render cycle.
            setHasApiKey(true);
            if (error?.includes('API key')) {
                resultDispatch({ type: actions.CLEAR_ERROR });
            }
        }
    };

    const isInputValid = useMemo(() => {
        return isInputReadyForAnalysis(activeInput, textContent, fileData);
    }, [activeInput, textContent, fileData]);
    
    const handleAnalysisModeChange = (mode: AnalysisMode) => {
        inputDispatch({ type: actions.SET_ANALYSIS_MODE, payload: mode });
    };

    const handleForensicModeChange = (mode: ForensicMode) => {
        inputDispatch({ type: actions.SET_FORENSIC_MODE, payload: mode });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInputValid && hasApiKey) {
            performAnalysis();
        } else if (!hasApiKey) {
             resultDispatch({ type: actions.ANALYSIS_ERROR, payload: 'Please select an API key to begin the analysis.' });
        } else {
             resultDispatch({ type: actions.ANALYSIS_ERROR, payload: 'Please provide valid input before starting the analysis.' });
        }
    };
    
    const hasInput = textContent.trim().length > 0 || fileData.length > 0;

    const renderInput = () => {
        switch (activeInput) {
            case 'text':
                return <TextInputPanel />;
            case 'file':
                return <FileUploadDisplay />;
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
                        
                        {activeInput === 'file' && (
                          <ForensicModeToggle selectedMode={forensicMode} onModeChange={handleForensicModeChange} />
                        )}
                        
                        <ModeSelector selectedMode={analysisMode} onModeChange={handleAnalysisModeChange} />

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400/50 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="mt-8 flex items-center justify-center gap-4">
                            {isCheckingApiKey ? (
                                <div className="h-[136px] flex items-center justify-center">
                                    <Icon name="spinner" className="w-6 h-6 animate-spin text-slate-500" />
                                </div>
                            ) : !hasApiKey ? (
                                <div className="text-center">
                                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                                        To perform an analysis, please select a Google AI Studio API key.
                                        <br />
                                        For information on billing, please visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">ai.google.dev/gemini-api/docs/billing</a>.
                                    </p>
                                    <Button type="button" onClick={handleSelectKey}>
                                        Select API Key to Begin
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={!isInputValid}
                                    >
                                        Begin Deduction
                                    </Button>
                                    {hasInput && (
                                        <Button
                                            type="button"
                                            variant="clear"
                                            onClick={handleClearInputs}
                                        >
                                            <Icon name="x-mark" className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Clear</span>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};