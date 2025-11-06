import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import * as actions from '../context/actions';
import { analyzeContent } from '../services/geminiService';
import type { ForensicMode } from '../types';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { state: resultState, dispatch: resultDispatch } = useResultState();

    const performAnalysis = useCallback(() => {
        const { activeInput, textContent, fileData, analysisMode, forensicMode } = inputState;

        let evidence;
        const images = fileData.map(f => f.imageBase64).filter(Boolean) as string[];

        switch(activeInput) {
            case 'text':
                evidence = { type: 'text', content: textContent };
                break;
            case 'file':
                evidence = { type: 'file', content: fileData.map(f => f.name).join(', ') };
                break;
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
            analysisMode,
            forensicMode,
            activeInput,
        })
        .then(result => resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result } }))
        .catch(err => resultDispatch({ type: actions.ANALYSIS_ERROR, payload: err.message }));

    }, [inputState, resultDispatch]);

    const handleChallenge = useCallback((mode: ForensicMode) => {
        if (!resultState.analysisEvidence) return;

        // FIX: Corrected typo from START_REANALysis to START_REANALYSIS
        resultDispatch({ type: actions.START_REANALYSIS });

        const isImageChallenge = resultState.analysisEvidence.type === 'file';
        const images = isImageChallenge ? inputState.fileData.map(f => f.imageBase64).filter(Boolean) as string[] : null;
        const text = !isImageChallenge ? resultState.analysisEvidence.content : null;
        
        analyzeContent({
            text,
            images,
            analysisMode: 'deep', // Re-analysis is always deep
            forensicMode: mode,
            systemInstructionPreamble: "This is a re-analysis. The user was not satisfied with the initial verdict. Adopt a more critical, skeptical perspective and provide a fresh, more detailed explanation.",
            activeInput: resultState.analysisEvidence.type,
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
        resultDispatch({ type: actions.CLEAR_ERROR }); // Fix: Clear error on input clear
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [inputDispatch, resultDispatch]);
    
    return {
        performAnalysis,
        handleChallenge,
        handleNewAnalysis,
        handleClearInputs
    };
};
