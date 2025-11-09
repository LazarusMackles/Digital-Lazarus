import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import * as actions from '../context/actions';
import { runAnalysis } from '../services/analysisService';
import type { AnalysisEvidence } from '../types';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: resultDispatch } = useResultState();

    const performAnalysis = useCallback(async (isReanalysis = false) => {
        const { activeInput, textContent, fileData, analysisMode, forensicMode } = inputState;

        // For re-analysis, we force a deep dive.
        const currentAnalysisMode = isReanalysis ? 'deep' : analysisMode;

        // Prepare evidence payload
        let evidence: AnalysisEvidence;
        if (activeInput === 'text') {
            evidence = { type: 'text', content: textContent };
        } else {
            // For file evidence, we stringify the file data array.
            // This is how we pass it to the result state for display.
            const fileContent = JSON.stringify(fileData.map(f => ({
                name: f.name,
                imageBase64: f.imageBase64,
            })));
            evidence = { type: 'file', content: fileContent };
        }
        
        // Dispatch start action
        if (isReanalysis) {
            resultDispatch({ type: actions.START_REANALYSIS });
        } else {
            resultDispatch({ type: actions.START_ANALYSIS, payload: { evidence, analysisMode: currentAnalysisMode } });
        }

        try {
            // Handler for streaming updates
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
                onStreamUpdate // Pass the handler
            );
            
            resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, modelName, isSecondOpinion: isReanalysis } });

        } catch (error) {
            console.error("Analysis workflow error:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            resultDispatch({ type: actions.ANALYSIS_ERROR, payload: errorMessage });
        }

    }, [inputState, resultDispatch]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        inputDispatch({ type: actions.CLEAR_INPUTS });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [resultDispatch, inputDispatch]);
    
    const handleClearInputs = useCallback(() => {
        inputDispatch({ type: actions.CLEAR_INPUTS });
        resultDispatch({ type: actions.CLEAR_ERROR });
    }, [inputDispatch, resultDispatch]);

    return { performAnalysis, handleNewAnalysis, handleClearInputs };
};
