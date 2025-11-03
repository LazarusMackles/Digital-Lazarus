import React from 'react';
import { InputTabs } from './InputTabs';
import { ModeSelector } from './ModeSelector';
import { ForensicModeToggle } from './ForensicModeToggle';
import { SpinnerIcon } from './icons';
import { useAnalysis } from '../context/AnalysisContext';
import { HowItWorks } from './HowItWorks';

const validateUrl = (value: string): boolean => {
    if (!value) return true;
    try {
        new URL(value);
        return value.includes('.') && !value.startsWith('http://.') && !value.startsWith('https://.');
    } catch (_) {
        return value.includes('.') && !value.startsWith('.') && !value.endsWith('.') && !value.includes(' ');
    }
};

export const InputForm: React.FC = () => {
    const {
        textContent,
        setTextContent,
        imageData,
        url,
        setUrl,
        isUrlValid,
        setIsUrlValid,
        fileNames,
        handleFilesChange,
        handleClearFiles,
        forensicMode,
        setForensicMode,
        analysisMode,
        setAnalysisMode,
        error,
        isLoading,
        cooldown,
        handleAnalyze,
        activeInput,
        setActiveInput
    } = useAnalysis();

    const handleUrlChange = (value: string) => {
        setUrl(value);
        setIsUrlValid(validateUrl(value));
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
            <HowItWorks />

            <InputTabs
                onTextChange={setTextContent}
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