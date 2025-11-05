import React from 'react';
import { InputTabs } from './InputTabs';
import { ModeSelector } from './ModeSelector';
import { ForensicModeToggle } from './ForensicModeToggle';
import { SpinnerIcon } from './icons/index';
import { useAnalysis } from '../context/AnalysisContext';
import { HowItWorks } from './HowItWorks';
import { TrainingScenarios } from './TrainingScenarios';

const validateUrl = (value: string): boolean => {
    if (!value) return true;
    try {
        new URL(value);
        return value.includes('.') && !value.startsWith('http://.') && !value.startsWith('https://.');
    } catch (_) {
        return value.includes('.') && !value.startsWith('.') && !value.endsWith('.') && !value.includes(' ');
    }
};

const InputFormComponent: React.FC = () => {
    const {
        textContent,
        imageData,
        url,
        isUrlValid,
        fileNames,
        forensicMode,
        analysisMode,
        error,
        isLoading,
        cooldown,
        handleAnalyze,
        activeInput,
        dispatch
    } = useAnalysis();

    const handleTextChange = (text: string) => dispatch({ type: 'SET_TEXT_CONTENT', payload: text });
    const handleFilesChange = (files: { name: string, content?: string | null, imageBase64?: string | null }[]) => dispatch({ type: 'HANDLE_FILES_CHANGE', payload: files });
    const handleClearFiles = () => dispatch({ type: 'CLEAR_FILES' });
    const setAnalysisMode = (mode: 'quick' | 'deep') => dispatch({ type: 'SET_ANALYSIS_MODE', payload: mode });
    const setForensicMode = (mode: 'standard' | 'technical' | 'conceptual') => dispatch({ type: 'SET_FORENSIC_MODE', payload: mode });
    const setActiveInput = (type: 'text' | 'file' | 'url') => dispatch({ type: 'SET_ACTIVE_INPUT', payload: type });

    const handleUrlChange = (value: string) => {
        dispatch({ type: 'SET_URL', payload: value });
        dispatch({ type: 'SET_IS_URL_VALID', payload: validateUrl(value) });
    };

    const isInputEmpty = !textContent.trim() && (!imageData || imageData.length === 0) && !url.trim();
    const isButtonDisabled = isInputEmpty || !isUrlValid || isLoading || cooldown > 0;

    const getButtonText = () => {
        if (isLoading) {
            return (
                <>
                    <SpinnerIcon className="animate-spin w-6 h-6 mr-3" />
                    <span>Deducing ...</span>
                </>
            );
        }
        if (cooldown > 0) {
            return `On Cooldown (${cooldown}s)`;
        }
        return 'Deduce the Digital DNA';
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50">
            <TrainingScenarios />
            <HowItWorks />
            
            <InputTabs
                onTextChange={handleTextChange}
                onFilesChange={handleFilesChange}
                onClearFiles={handleClearFiles}
                onUrlChange={handleUrlChange}
                textContent={textContent}
                fileNames={fileNames}
                imageData={imageData}
                url={url}
                isUrlValid={isUrlValid}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
            />
            
            {imageData && imageData.length > 0 && <ForensicModeToggle selectedMode={forensicMode} onModeChange={setForensicMode} />}
            
            <ModeSelector selectedMode={analysisMode} onModeChange={setAnalysisMode} />
            
            {error && <p aria-live="polite" className="my-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg animate-fade-in">{error}</p>}
            
            <div className="flex justify-center">
                <button
                    onClick={handleAnalyze}
                    disabled={isButtonDisabled}
                    className={`w-full sm:w-auto px-10 py-4 text-lg font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-500 disabled:opacity-60 disabled:shadow-none transform hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-wait flex items-center justify-center ${
                        isLoading ? 'animate-pulse-deduce' : ''
                    }`}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};

export const InputForm = React.memo(InputFormComponent);