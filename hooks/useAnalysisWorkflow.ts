import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import * as actions from '../context/actions';
import { runAnalysis } from '../services/analysisService';
import type { AnalysisEvidence } from '../types';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: resultDispatch } = useResultState();
    const { dispatch: uiDispatch } = useUIState();

    const performAnalysis = useCallback(async (isReanalysis = false) => {
        const { activeInput, textContent, fileData, analysisMode, forensicMode } = inputState;

        const currentAnalysisMode = isReanalysis ? 'deep' : analysisMode;

        let evidence: AnalysisEvidence;
        if (activeInput === 'text') {
            evidence = { type: 'text', content: textContent };
        } else {
            const fileContent = JSON.stringify(fileData.map(f => ({
                name: f.name,
                imageBase64: f.imageBase64,
            })));
            evidence = { type: 'file', content: fileContent };
        }
        
        uiDispatch({ type: actions.SET_LOADING, payload: true });

        if (isReanalysis) {
            uiDispatch({ type: actions.SET_REANALYZING, payload: true });
            uiDispatch({ type: actions.SET_STREAMING, payload: true });
            resultDispatch({ type: actions.START_REANALYSIS });
        } else {
            const shouldStream = currentAnalysisMode === 'deep';
            uiDispatch({ type: actions.SET_STREAMING, payload: shouldStream });
            resultDispatch({ type: actions.START_ANALYSIS, payload: { evidence, analysisMode: currentAnalysisMode } });
        }

        try {
            const onStreamUpdate = (partialExplanation: string) => {
                resultDispatch({ 
                    type: actions.STREAM_ANALYSIS_UPDATE, 
                    payload: { explanation: partialExplanation }
                });
            };

            const { result, modelName } = await runAnalysis(
                activeInput,
                textContent,
                fileData.map(f => ({ name: f.name, imageBase64: f.imageBase64 as string })),
                currentAnalysisMode,
                forensicMode,
                onStreamUpdate
            );
            
            resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, modelName, isSecondOpinion: isReanalysis } });

        } catch (error) {
            console.error("Analysis workflow error:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            uiDispatch({ type: actions.SET_ERROR, payload: errorMessage });
        } finally {
            uiDispatch({ type: actions.SET_LOADING, payload: false });
            uiDispatch({ type: actions.SET_STREAMING, payload: false });
            uiDispatch({ type: actions.SET_REANALYZING, payload: false });
        }

    }, [inputState, resultDispatch, uiDispatch]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        // The line below is removed to preserve user inputs (text and files) for iterative analysis.
        // inputDispatch({ type: actions.CLEAR_INPUTS });
        uiDispatch({ type: actions.CLEAR_ERROR });
        window.scrollTo(0, 0);
    }, [resultDispatch, uiDispatch]);
    
    const handleClearInputs = useCallback(() => {
        inputDispatch({ type: actions.CLEAR_INPUTS });
        uiDispatch({ type: actions.CLEAR_ERROR });
        window.scrollTo(0, 0);
    }, [inputDispatch, uiDispatch]);

    return { performAnalysis, handleNewAnalysis, handleClearInputs };
};