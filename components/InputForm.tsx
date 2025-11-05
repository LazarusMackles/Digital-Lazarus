

import React, { useCallback, useMemo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { analyzeContent } from '../services/geminiService';
import type { AnalysisMode, ForensicMode } from '../types';
import { InputTabs } from './InputTabs';
import { FileUploadDisplay } from './FileUploadDisplay';
import { ModeSelector } from './ModeSelector';
import { ForensicModeToggle } from './ForensicModeToggle';
import { HowItWorks } from './HowItWorks';
import { TrainingScenarios } from './TrainingScenarios';

export const InputForm: React.FC = () => {
    const { 
        dispatch, 
        activeInput, 
        textContent, 
        url, 
        fileData, 
        analysisMode,
        forensicMode,
        error
    } = useAnalysis();

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'SET_TEXT_CONTENT', payload: e.target.value });
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_URL', payload: e.target.value });
    };

    const handleModeChange = (mode: AnalysisMode) => {
        dispatch({ type: 'SET_ANALYSIS_MODE', payload: mode });
    };
    
    const handleForensicModeChange = (mode: ForensicMode) => {
        dispatch({ type: 'SET_FORENSIC_MODE', payload: mode });
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

        let evidence;
        const images = fileData.map(f => f.imageBase64).filter(Boolean) as string[];

        switch(activeInput) {
            case 'text':
                evidence = { type: 'text', content: textContent };
                break;
            case 'file':
                evidence = { type: 'file', content: fileData.map(f => f.name).join(', ') };
                break;
            case 'url':
                evidence = { type: 'url', content: url };
                break;
            default:
                return;
        }
        
        dispatch({ 
            type: 'START_ANALYSIS', 
            payload: { 
                evidence,
                forensicMode: activeInput === 'file' ? forensicMode : 'standard',
            } 
        });

        analyzeContent({
            text: activeInput === 'text' ? textContent : null,
            images: activeInput === 'file' ? images : null,
            url: activeInput === 'url' ? url : null,
            analysisMode,
            forensicMode: activeInput === 'file' ? forensicMode : 'standard',
        })
        .then(result => dispatch({ type: 'ANALYSIS_SUCCESS', payload: { result } }))
        .catch(err => dispatch({ type: 'ANALYSIS_ERROR', payload: err.message }));
    
    }, [activeInput, textContent, fileData, url, analysisMode, forensicMode, dispatch, isSubmissionDisabled]);
    
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

    return (
      <div className="animate-fade-in-up" id="input-area">
        <TrainingScenarios />
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

            <div className="mt-6 text-center">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmissionDisabled}
                    className="flex items-center justify-center gap-2 mx-auto px-10 py-4 font-bold text-white bg-gradient-to-r from-cyan-600 to-fuchsia-600 rounded-full shadow-lg shadow-cyan-500/30 hover:from-cyan-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none"
                >
                    <span>Begin Analysis</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    );
};