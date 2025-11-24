

import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import * as actions from '../context/actions';
import { 
    buildPrompt, 
    finalizeForensicVerdict, 
    finalizeProvenanceVerdict 
} from '../services/analysisService';
import { analyzeWithSightengine } from '../services/sightengineService';
import { analyzeContent, analyzeWithSearch } from '../api/analyze';
import { MODELS } from '../utils/constants';
import type { AnalysisEvidence } from '../types';
import { useApiKeys } from './useApiKeys';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: resultDispatch } = useResultState();
    const { dispatch: uiDispatch } = useUIState();
    const { googleApiKey, sightengineApiKey } = useApiKeys();

    const performAnalysis = useCallback(async (isReanalysis = false) => {
        const { fileData, analysisAngle } = inputState;

        if (!fileData || !fileData.imageBase64) {
            uiDispatch({ type: actions.SET_ERROR, payload: 'Image data is missing.' });
            return;
        }

        const evidence: AnalysisEvidence = { type: 'file', content: JSON.stringify(fileData) };
        
        if (isReanalysis) {
            resultDispatch({ type: actions.START_REANALYSIS });
        } else {
            resultDispatch({ type: actions.START_ANALYSIS, payload: { evidence, analysisAngle } });
        }

        try {
            if (!googleApiKey) {
                throw new Error("Google API Key is missing.");
            }

            const modelName = MODELS.PRO;
            const filesForApi = [{ name: fileData.name, imageBase64: fileData.imageBase64 }];

            if (analysisAngle === 'provenance') {
                uiDispatch({ type: actions.START_CONTEXT_ANALYSIS });
                const prompt = buildPrompt(fileData, 'provenance', isReanalysis);
                const response = await analyzeWithSearch(prompt, filesForApi, modelName, googleApiKey);
                const result = finalizeProvenanceVerdict(response);
                resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, modelName, isSecondOpinion: isReanalysis } });

            } else { // 'forensic' or 'hybrid'
                let sightengineScore: number | undefined;
                if (analysisAngle === 'hybrid') {
                    if (!sightengineApiKey) {
                        throw new Error("Sightengine API Key is missing for Hybrid Analysis.");
                    }
                    uiDispatch({ type: actions.START_PIXEL_ANALYSIS });
                     try {
                        const sightengineResult = await analyzeWithSightengine(fileData.imageBase64, sightengineApiKey);
                        sightengineScore = Math.round(sightengineResult.ai_generated * 100);
                    } catch (e) {
                        throw new Error(`Sightengine analysis failed: ${e instanceof Error ? e.message : String(e)}`);
                    }
                }

                uiDispatch({ type: actions.START_CONTEXT_ANALYSIS });
                const prompt = buildPrompt(fileData, analysisAngle, isReanalysis, sightengineScore);
                const rawResult = await analyzeContent(prompt, filesForApi, modelName, googleApiKey);
                const result = finalizeForensicVerdict(rawResult, sightengineScore);
                resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, modelName, isSecondOpinion: isReanalysis } });
            }
            
            uiDispatch({ type: actions.ANALYSIS_COMPLETE });

        } catch (error) {
            console.error("Analysis workflow error:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            uiDispatch({ type: actions.SET_ERROR, payload: errorMessage });
        }

    }, [inputState, googleApiKey, sightengineApiKey, resultDispatch, uiDispatch]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        uiDispatch({ type: actions.RESET_ANALYSIS_STATE });
        window.scrollTo(0, 0);
    }, [resultDispatch, uiDispatch]);
    
    const handleClearInputs = useCallback(() => {
        inputDispatch({ type: actions.CLEAR_INPUTS });
        uiDispatch({ type: actions.CLEAR_ERROR });
        window.scrollTo(0, 0);
    }, [inputDispatch, uiDispatch]);

    return { performAnalysis, handleNewAnalysis, handleClearInputs };
};
