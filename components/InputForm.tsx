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

const EXAMPLE_TEXT = `The synergistic alignment of our core competencies with next-generation paradigms is pivotal for cultivating a value-driven ecosystem. By leveraging blockchain-enabled platforms and deep learning algorithms, we can architect a robust framework for scalable, frictionless user engagement. This strategic initiative will empower stakeholders to seamlessly integrate cross-functional solutions, thereby maximizing ROI and future-proofing our market position against disruptive technological shifts. Our commitment to agile methodologies ensures a dynamic and iterative approach to innovation.`;

// A small, public-domain AI-generated image of an astronaut cat
const EXAMPLE_IMAGE_BASE64 = 'data:image/png;base64,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';
const EXAMPLE_IMAGE_FILENAME = 'ai_astronaut_cat.png';
const EXAMPLE_URL = 'https://en.wikipedia.org/wiki/Generative_artificial_intelligence';

export const InputForm: React.FC = () => {
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

    const handleUseExampleText = () => dispatch({ type: 'SET_TEXT_CONTENT', payload: EXAMPLE_TEXT });
    const handleUseExampleImage = () => dispatch({ type: 'HANDLE_FILES_CHANGE', payload: [{ name: EXAMPLE_IMAGE_FILENAME, imageBase64: EXAMPLE_IMAGE_BASE64 }] });
    const handleUseExampleUrl = () => {
        dispatch({ type: 'SET_URL', payload: EXAMPLE_URL });
        dispatch({ type: 'SET_IS_URL_VALID', payload: true });
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
                onUseExampleText={handleUseExampleText}
                onUseExampleImage={handleUseExampleImage}
                onUseExampleUrl={handleUseExampleUrl}
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