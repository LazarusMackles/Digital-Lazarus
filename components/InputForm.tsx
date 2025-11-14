import React, { useCallback, useMemo } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useUIState } from '../context/UIStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import { useApiKey } from '../hooks/useApiKey';
import * as actions from '../context/actions';
import { Card, Button, InputTabs, HowItWorks, OptionGroup } from './ui';
import { Icon } from './icons/index';
import { TextInputPanel } from './TextInputPanel';
import { isInputReadyForAnalysis } from '../utils/validation';
import type { AnalysisAngle } from '../types';
import { FileUploadDisplay } from './FileUploadDisplay';

const ANALYSIS_ANGLE_OPTIONS = [
    { value: 'forensic', title: 'Forensic Analysis', description: 'Analyzes the image content for digital fingerprints and AI artifacts.' },
    { value: 'provenance', title: 'Provenance Dossier', description: 'Investigates the image\'s history and fact-checks across the web. (Slower)' },
] as const;


export const InputForm: React.FC = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: uiState, dispatch: uiDispatch } = useUIState();
    const { performAnalysis, handleClearInputs } = useAnalysisWorkflow();
    const { hasApiKey, isChecking: isCheckingApiKey, selectApiKey } = useApiKey();

    const {
        textContent,
        fileData,
        activeInput,
        analysisAngle,
    } = inputState;
    const { error } = uiState;

    const isInputValid = useMemo(() => {
        return isInputReadyForAnalysis(activeInput, textContent, fileData);
    }, [activeInput, textContent, fileData]);
    
    const handleAnalysisAngleChange = (angle: AnalysisAngle) => {
        inputDispatch({ type: actions.SET_ANALYSIS_ANGLE, payload: angle });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (error?.includes('API key')) {
            uiDispatch({ type: actions.CLEAR_ERROR });
        }
        
        if (isInputValid && hasApiKey) {
            window.scrollTo(0, 0); 
            performAnalysis();
        } else if (!hasApiKey) {
             uiDispatch({ type: actions.SET_ERROR, payload: 'Please select an API key to begin the analysis.' });
        } else {
             uiDispatch({ type: actions.SET_ERROR, payload: 'Please provide valid input before starting the analysis.' });
        }
    };
    
    const hasInput = textContent.trim().length > 0 || fileData !== null;

    const onClearClick = useCallback(() => {
        handleClearInputs();
    }, [handleClearInputs]);

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
                          <OptionGroup
                              legend="Select Analysis Angle"
                              options={ANALYSIS_ANGLE_OPTIONS}
                              selectedValue={analysisAngle}
                              onValueChange={handleAnalysisAngleChange}
                              size="md"
                          />
                        )}

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
                                    <Button type="button" onClick={selectApiKey}>
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
                                            onClick={onClearClick}
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