import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import * as actions from '../context/actions';
import { analyzeContent } from '../services/geminiService';
import type { ForensicMode } from '../types';
import { MODELS } from '../utils/constants';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: resultState, dispatch: resultDispatch } = useResultState();

    const performAnalysis = useCallback(() => {
        const { activeInput, textContent, fileData, url, analysisMode, forensicMode } = inputState;

        let evidence;
        const images = fileData.map(f => f.imageBase64).filter(Boolean) as string[];

        switch(activeInput) {
            case 'text':
                // No longer sanitizing; the UI prevents submission with URLs.
                evidence = { type: 'text', content: textContent };
                break;
            case 'file':
                evidence = { type: 'file', content: fileData.map(f => f.name).join(', ') };
                break;
            case 'url':
                 // URL feature is disabled at the component level.
                resultDispatch({ type: actions.ANALYSIS_ERROR, payload: "URL analysis is temporarily unavailable." });
                return;
            default:
                console.error("Attempted analysis with unknown input type.");
                return;
        }
        
        resultDispatch({ 
            type: actions.START_ANALYSIS, 
            payload: { 
                evidence,
                analysisMode,
            } 
        });

        analyzeContent({
            text: activeInput === 'text' ? textContent : null,
            images: activeInput === 'file' ? images : null,
            url: activeInput === 'url' ? url : null,
            analysisMode,
            forensicMode: activeInput === 'file' ? forensicMode : 'standard',
        })
        .then(result => resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result } }))
        .catch(err => resultDispatch({ type: actions.ANALYSIS_ERROR, payload: err.message }));

    }, [inputState, resultDispatch]);

    const handleChallenge = useCallback((newForensicMode: ForensicMode) => {
        if (!resultState.analysisEvidence) return;

        resultDispatch({ type: actions.START_REANALYSIS });

        const images = resultState.analysisEvidence.type === 'file' ? inputState.fileData.map(f => f.imageBase64).filter(Boolean) as string[] : null;
        
        analyzeContent({
            text: null, // Re-analysis is only for images in the current setup
            images: images,
            url: null,
            analysisMode: 'deep', // Re-analysis is always deep
            forensicMode: newForensicMode,
            systemInstructionPreamble: "This is a re-analysis. The user was not satisfied with the initial verdict. Adopt a more critical, skeptical perspective. Focus specifically on the requested forensic angle and provide a fresh, a more detailed explanation."
        })
        .then(result => resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, isSecondOpinion: true } }))
        .catch(error => resultDispatch({ type: actions.ANALYSIS_ERROR, payload: error.message }));
    }, [resultState.analysisEvidence, inputState.fileData, resultDispatch]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        inputDispatch({ type: actions.CLEAR_INPUTS });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [resultDispatch, inputDispatch]);

    const handleClearInputs = useCallback(() => {
        inputDispatch({ type: actions.CLEAR_INPUTS });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [inputDispatch]);
    
    return {
        performAnalysis,
        handleChallenge,
        handleNewAnalysis,
        handleClearInputs
    };
};