
import React, { useCallback, useMemo } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useUIState } from '../context/UIStateContext';
import { useAnalysisWorkflow } from '../hooks/useAnalysisWorkflow';
import { useApiKeys } from '../hooks/useApiKeys';
import * as actions from '../context/actions';
import { Card, Button, HowItWorks, OptionGroup, ApiKeyOnboardingModal } from './ui';
import { Icon } from './icons/index';
import { isInputReadyForAnalysis } from '../utils/validation';
import type { AnalysisAngle } from '../types';
import { FileUploadDisplay } from './FileUploadDisplay';

const ANALYSIS_ANGLE_OPTIONS: ReadonlyArray<{ value: AnalysisAngle; title: string; description: string }> = [
    { value: 'forensic', title: 'Forensic Analysis', description: 'A deep dive into the image\'s content for digital fingerprints and AI artefacts.' },
    { value: 'provenance', title: 'Provenance Dossier', description: 'Investigates the image\'s history and fact-checks across the web.' },
    { value: 'hybrid', title: 'Hybrid Analysis', description: 'Cross-references a pixel scan with Gemini\'s interpretation for the highest accuracy.' },
];


export const InputForm: React.FC = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: uiState, dispatch: uiDispatch } = useUIState();
    const { performAnalysis, handleClearInputs } = useAnalysisWorkflow();
    const { hasGoogleApiKey, hasSightengineApiKey } = useApiKeys();

    const {
        fileData,
        analysisAngle,
    } = inputState;
    const { error, showApiKeyOnboarding } = uiState;

    const isInputValid = useMemo(() => {
        return isInputReadyForAnalysis(fileData);
    }, [fileData]);
    
    const handleAnalysisAngleChange = (angle: AnalysisAngle) => {
        inputDispatch({ type: actions.SET_ANALYSIS_ANGLE, payload: angle });
    };

    const handleOpenSettings = () => {
        uiDispatch({ type: actions.SET_SHOW_SETTINGS_MODAL, payload: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (error) uiDispatch({ type: actions.CLEAR_ERROR });

        if (!isInputValid) {
            uiDispatch({ type: actions.SET_ERROR, payload: 'Please upload an image to begin.' });
            return;
        }

        if (!hasGoogleApiKey) {
            uiDispatch({ type: actions.SET_ERROR, payload: 'Please enter your Google API Key in the Settings panel.' });
            handleOpenSettings();
            return;
        }

        if (analysisAngle === 'hybrid' && !hasSightengineApiKey) {
            uiDispatch({ type: actions.SET_SHOW_API_KEY_ONBOARDING, payload: true });
            return;
        }
        
        window.scrollTo(0, 0); 
        performAnalysis();
    };
    
    const hasInput = fileData !== null;

    const onClearClick = useCallback(() => {
        handleClearInputs();
    }, [handleClearInputs]);

    return (
        <div className="space-y-4 animate-fade-in">
            {showApiKeyOnboarding && <ApiKeyOnboardingModal />}
            <HowItWorks />
            
            {!hasGoogleApiKey && (
                <div className="mx-auto w-full max-w-2xl p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-full text-amber-600 dark:text-amber-400 flex-shrink-0">
                         <Icon name="key" className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">Authentication Required</h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Sleuther needs your Google API Key to power its engines.</p>
                    </div>
                    <Button onClick={handleOpenSettings} variant="secondary" className="whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm">
                        Connect Key
                    </Button>
                </div>
            )}
            
            <Card>
                <form onSubmit={handleSubmit} id="input-area">
                    <div className="">
                        <FileUploadDisplay />
                        
                        <OptionGroup
                            legend="Select Analysis Angle"
                            options={ANALYSIS_ANGLE_OPTIONS}
                            selectedValue={analysisAngle}
                            onValueChange={handleAnalysisAngleChange}
                            size="md"
                        />

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400/50 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                type="submit"
                                disabled={!isInputValid || !hasGoogleApiKey}
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
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};
