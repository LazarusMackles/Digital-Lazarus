
import React, { useState, useCallback, useMemo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { analyzeContent } from '../services/geminiService';
import { InputTabs } from './InputTabs';
import { ModeSelector } from './ModeSelector';
import { ForensicModeToggle } from './ForensicModeToggle';
import { HowItWorks } from './HowItWorks';
import { TrainingScenarios } from './TrainingScenarios';
import { SpinnerIcon } from './icons';
import type { InputType, AnalysisEvidence } from '../types';

export const InputForm: React.FC = () => {
    const { 
        dispatch,
        textContent,
        fileData,
        url,
        activeInput,
        analysisMode,
        forensicMode,
        error,
    } = useAnalysis();

    const [isUrlValid, setIsUrlValid] = useState(true);

    const onTextChange = (text: string) => dispatch({ type: 'SET_TEXT_CONTENT', payload: text });
    const onFilesChange = (files: { name: string; imageBase64?: string | null; content?: string | null }[]) => dispatch({ type: 'SET_FILE_DATA', payload: files });
    const onClearFiles = () => dispatch({ type: 'CLEAR_FILES' });
    const onUrlChange = (newUrl: string) => {
        dispatch({ type: 'SET_URL', payload: newUrl });
        try {
            new URL(newUrl);
            setIsUrlValid(true);
        } catch (_) {
            if (newUrl) setIsUrlValid(false);
            else setIsUrlValid(true); // Empty is not invalid
        }
    };
    const setActiveInput = (type: InputType) => dispatch({ type: 'SET_ACTIVE_INPUT', payload: type });

    const isImageAnalysis = useMemo(() => 
        activeInput === 'file' && fileData.length > 0 && !!fileData[0].imageBase64, 
        [activeInput, fileData]
    );

    const isSubmitDisabled = useMemo(() => {
        switch (activeInput) {
            case 'text': return textContent.trim().length < 20;
            case 'file': return fileData.length === 0;
            case 'url': return !url || !isUrlValid;
            default: return true;
        }
    }, [activeInput, textContent, fileData, url, isUrlValid]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitDisabled) return;

        let evidence: AnalysisEvidence | null = null;
        let images: string[] | null = null;
        let text: string | null = null;
        let analysisUrl: string | null = null;

        switch (activeInput) {
            case 'text':
                evidence = { type: 'text', content: textContent };
                text = textContent;
                break;
            case 'file':
                if (isImageAnalysis) {
                    evidence = { type: 'file', content: fileData.map(f => f.name).join(', ') };
                    images = fileData.map(f => f.imageBase64!).filter(Boolean);
                } else {
                    evidence = { type: 'text', content: fileData[0].content || '' };
                    text = fileData[0].content || '';
                }
                break;
            case 'url':
                evidence = { type: 'url', content: url };
                analysisUrl = url;
                break;
        }

        if (evidence) {
            dispatch({ type: 'START_ANALYSIS', payload: { evidence, mode: analysisMode, forensicMode } });
            analyzeContent({ text, images, url: analysisUrl, analysisMode, forensicMode })
                .then(result => dispatch({ type: 'ANALYSIS_SUCCESS', payload: { result } }))
                .catch(err => dispatch({ type: 'ANALYSIS_ERROR', payload: err.message }));
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 animate-fade-in-up">
            <HowItWorks />
            <TrainingScenarios />
            
            <form onSubmit={handleSubmit}>
                <InputTabs
                    activeInput={activeInput}
                    setActiveInput={setActiveInput}
                    onTextChange={onTextChange}
                    onFilesChange={onFilesChange}
                    onClearFiles={onClearFiles}
                    onUrlChange={onUrlChange}
                    textContent={textContent}
                    fileNames={fileData.map(f => f.name)}
                    imageData={fileData.map(f => f.imageBase64).filter(Boolean) as string[] | null}
                    url={url}
                    isUrlValid={isUrlValid}
                />
                
                {isImageAnalysis && (
                    <ForensicModeToggle
                        selectedMode={forensicMode}
                        onModeChange={(mode) => dispatch({ type: 'SET_FORENSIC_MODE', payload: mode })}
                    />
                )}

                <ModeSelector
                    selectedMode={analysisMode}
                    onModeChange={(mode) => dispatch({ type: 'SET_ANALYSIS_MODE', payload: mode })}
                />
                
                {error && (
                    <div className="my-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-500/50 rounded-lg text-center text-red-700 dark:text-red-300">
                        <p className="font-bold">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="w-full sm:w-auto px-10 py-4 font-bold text-white bg-gradient-to-r from-cyan-600 to-fuchsia-600 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-fuchsia-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        Initiate Deduction
                    </button>
                </div>
            </form>
        </div>
    );
};
