import { useCallback, useState } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import * as actions from '../context/actions';
import { runAnalysis } from '../services/analysisService';
import type { AnalysisEvidence } from '../types';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: resultDispatch } = useResultState();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        
        // Set local state instead of dispatching to UI context
        setIsLoading(true);
        setError(null);

        if (isReanalysis) {
            setIsReanalyzing(true);
            setIsStreaming(true); // Re-analysis always streams
            resultDispatch({ type: actions.START_REANALYSIS });
        } else {
            const shouldStream = currentAnalysisMode === 'deep';
            setIsStreaming(shouldStream);
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
            setError(errorMessage);
        } finally {
            // Reset all local transient state flags
            setIsLoading(false);
            setIsStreaming(false);
            setIsReanalyzing(false);
        }

    }, [inputState, resultDispatch]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        inputDispatch({ type: actions.CLEAR_INPUTS });
        document.documentElement.scrollTo(0, 0);
    }, [resultDispatch, inputDispatch]);
    
    const handleClearInputs = useCallback(() => {
        inputDispatch({ type: actions.CLEAR_INPUTS });
        // Error clearing is now the component's responsibility
        document.documentElement.scrollTo(0, 0);
    }, [inputDispatch]);

    return { performAnalysis, handleNewAnalysis, handleClearInputs, isLoading, isStreaming, isReanalyzing, error };
};