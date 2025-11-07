import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import * as actions from '../context/actions';
import type { ForensicMode } from '../types';
import { aggressivelyCompressImageForAnalysis } from '../utils/imageCompression';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: resultState, dispatch: resultDispatch } = useResultState();
    
    const performAnalysis = useCallback(async () => {
        const { activeInput, textContent, fileData, analysisMode, forensicMode } = inputState;

        let evidence;
        let images = fileData.map(f => f.imageBase64).filter(Boolean) as string[];

        // Apply compression to all images before sending
        if (activeInput === 'file' && images.length > 0) {
            try {
                images = await Promise.all(images.map(imgBase64 => aggressivelyCompressImageForAnalysis(imgBase64)));
            } catch (err) {
                 resultDispatch({ type: actions.ANALYSIS_ERROR, payload: 'Failed to optimize image for analysis. Please try again.' });
                 return;
            }
        }

        switch(activeInput) {
            case 'text': evidence = { type: 'text', content: textContent }; break;
            case 'file': evidence = { type: 'file', content: fileData.map(f => f.name).join(', ') }; break;
            default: console.error("Attempted analysis with unknown input type."); return;
        }
        
        resultDispatch({ type: actions.START_ANALYSIS, payload: { evidence, analysisMode } });

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: activeInput === 'text' ? textContent : null,
                    images: activeInput === 'file' ? images : null,
                    analysisMode,
                    forensicMode,
                    activeInput,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 && data.message?.includes("API key not valid")) {
                     throw new Error("The selected API key is not valid. Please select a valid key and try again.");
                }
                throw new Error(data.message || 'An unknown error occurred during analysis.');
            }
            
            resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result: data.result } });

        } catch (err: any) {
             if (err.message?.includes("API key not valid")) {
                resultDispatch({ type: actions.ANALYSIS_ERROR, payload: "The selected API key is not valid. Please select a different key and try again." });
             } else {
                resultDispatch({ type: actions.ANALYSIS_ERROR, payload: err.message });
             }
        }

    }, [inputState, resultDispatch]);

    const handleChallenge = useCallback(async (mode: ForensicMode) => {
        if (!resultState.analysisEvidence) return;
        
        resultDispatch({ type: actions.START_REANALYSIS });

        const isImageChallenge = resultState.analysisEvidence.type === 'file';
        let images = isImageChallenge ? inputState.fileData.map(f => f.imageBase64).filter(Boolean) as string[] : null;
        const text = !isImageChallenge ? resultState.analysisEvidence.content : null;

        if (isImageChallenge && images && images.length > 0) {
            try {
                 images = await Promise.all(images.map(imgBase64 => aggressivelyCompressImageForAnalysis(imgBase64)));
            } catch (err) {
                 resultDispatch({ type: actions.ANALYSIS_ERROR, payload: 'Failed to optimize image for re-analysis.' });
                 return;
            }
        }
        
         try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    images,
                    analysisMode: 'deep', // Re-analysis is always deep
                    forensicMode: mode,
                    systemInstructionPreamble: "This is a re-analysis. The user was not satisfied with the initial verdict. Adopt a more critical, skeptical perspective and provide a fresh, more detailed explanation.",
                    activeInput: resultState.analysisEvidence.type,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred during re-analysis.');
            }
            
            resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result: data.result, isSecondOpinion: true } });

        } catch (err: any) {
            resultDispatch({ type: actions.ANALYSIS_ERROR, payload: err.message });
        }
    }, [resultState.analysisEvidence, inputState.fileData, resultDispatch]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        inputDispatch({ type: actions.CLEAR_INPUTS });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [resultDispatch, inputDispatch]);

    const handleClearInputs = useCallback(() => {
        inputDispatch({ type: actions.CLEAR_INPUTS });
        resultDispatch({ type: actions.CLEAR_ERROR });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [inputDispatch, resultDispatch]);
    
    return {
        performAnalysis,
        handleChallenge,
        handleNewAnalysis,
        handleClearInputs
    };
};
