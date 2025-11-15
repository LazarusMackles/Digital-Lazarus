import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import * as actions from '../context/actions';
import { runAnalysis } from '../services/analysisService';
import type { AnalysisEvidence } from '../types';
import { useApiKeys } from './useApiKeys';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: resultDispatch } = useResultState();
    const { dispatch: uiDispatch } = useUIState();
    const { googleApiKey, sightengineApiKey } = useApiKeys();

    const performAnalysis = useCallback(async (isReanalysis = false) => {
        const { fileData, analysisAngle } = inputState;

        const fileContent = JSON.stringify(fileData);
        const evidence: AnalysisEvidence = { type: 'file', content: fileContent };
        
        uiDispatch({ type: actions.SET_LOADING, payload: true });

        if (isReanalysis) {
            uiDispatch({ type: actions.SET_REANALYZING, payload: true });
            uiDispatch({ type: actions.SET_STREAMING, payload: true }); // Provenance always streams
            resultDispatch({ type: actions.START_REANALYSIS });
        } else {
            const shouldStream = analysisAngle === 'provenance';
            uiDispatch({ type: actions.SET_STREAMING, payload: shouldStream });
            resultDispatch({ type: actions.START_ANALYSIS, payload: { evidence, analysisAngle } });
        }

        try {
            const onStreamUpdate = (partialExplanation: string) => {
                resultDispatch({ 
                    type: actions.STREAM_ANALYSIS_UPDATE, 
                    payload: { explanation: partialExplanation }
                });
            };

            if (!googleApiKey) {
                throw new Error("Google API Key is missing.");
            }
            if (analysisAngle === 'hybrid' && !sightengineApiKey) {
                 throw new Error("Sightengine API Key is missing for Hybrid Analysis.");
            }

            const { result, modelName } = await runAnalysis(
                fileData ? { name: fileData.name, imageBase64: fileData.imageBase64 as string } : null,
                analysisAngle,
                { google: googleApiKey, sightengine: sightengineApiKey },
                onStreamUpdate,
                isReanalysis,
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

    }, [inputState, googleApiKey, sightengineApiKey, resultDispatch, uiDispatch]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
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