import React, { useCallback, useMemo } from 'react';
import { InputTabs } from './InputTabs';
import { FileUploadDisplay } from './FileUploadDisplay';
import { ModeSelector } from './ModeSelector';
import { ForensicModeToggle } from './ForensicModeToggle';
import { HowItWorks } from './HowItWorks';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import * as actions from '../context/actions';
import { Card, Button } from './ui';
import { XMarkIcon } from './icons/index';
import { TextInputPanel } from './TextInputPanel';
import { UrlInputPanel } from './UrlInputPanel';
import { isInputReadyForAnalysis } from '../utils/validation';

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

    const handleAnalysisModeChange = useCallback((mode) => {
        inputDispatch({ type: actions.SET_ANALYSIS_MODE, payload: mode });
    }, [inputDispatch]);

    const handleForensicModeChange = useCallback((mode) => {
        inputDispatch({ type: actions.SET_FORENSIC_MODE, payload: mode });
    }, [inputDispatch]);

    const isInputValid = useMemo(() => {
        return isInputReadyForAnalysis(activeInput, textContent, fileData);
    }, [activeInput, textContent, fileData]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInputValid) {
            performAnalysis();
        } else {
             resultDispatch({ type: actions.ANALYSIS_ERROR, payload: 'Please provide valid input before starting the analysis.' });
        }
    };
    
    const hasInput = textContent.trim().length > 0 || fileData.length > 0 || url.trim().length > 0;

    const renderInput = () => {
        switch (activeInput) {
            case 'text':
                return <TextInputPanel />;
            case 'file':
                return <FileUploadDisplay />;
            case 'url':
                return <UrlInputPanel />;
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
                                    <XMarkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Clear</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};