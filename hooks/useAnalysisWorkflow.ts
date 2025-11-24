
import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import { useHistory } from '../context/HistoryContext';
import * as actions from '../context/actions';
import { 
    buildPrompt, 
    finalizeForensicVerdict, 
    finalizeProvenanceVerdict 
} from '../services/analysisService';
import { analyzeWithSightengine } from '../services/sightengineService';
import { analyzeContent, analyzeWithSearch } from '../services/geminiService';
import { aggressivelyCompressImageForAnalysis } from '../utils/imageCompression';
import { MODELS } from '../utils/constants';
import type { AnalysisEvidence } from '../types';
import { useApiKeys } from './useApiKeys';

export const useAnalysisWorkflow = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: resultDispatch } = useResultState();
    const { dispatch: uiDispatch } = useUIState();
    const { addToHistory } = useHistory();
    const { googleApiKey, sightengineApiKey } = useApiKeys();

    const performAnalysis = useCallback(async (isReanalysis = false) => {
        const { fileData, analysisAngle } = inputState;

        if (!fileData || !fileData.imageBase64) {
            uiDispatch({ type: actions.SET_ERROR, payload: 'Image data is missing.' });
            return;
        }

        // MEMORY OPTIMIZATION: Store only a reference to the file, not the full base64 string.
        // The ResultDisplay will read the actual image from InputState.
        const evidence: AnalysisEvidence = { 
            type: 'reference', 
            fileRef: 'input_file', 
            filename: fileData.name 
        };
        
        if (isReanalysis) {
            resultDispatch({ type: actions.START_REANALYSIS });
        } else {
            resultDispatch({ type: actions.START_ANALYSIS, payload: { evidence, analysisAngle } });
        }

        try {
            if (!googleApiKey) {
                throw new Error("Google API Key is missing.");
            }

            // PERFORMANCE OPTIMIZATION: Compress image before sending to API to reduce latency.
            const compressedImage = await aggressivelyCompressImageForAnalysis(fileData.imageBase64);
            const filesForApi = [{ name: fileData.name, imageBase64: compressedImage }];

            let result, modelName;

            if (analysisAngle === 'provenance') {
                // Use Flash for Provenance
                modelName = MODELS.FLASH; 
                
                uiDispatch({ type: actions.START_CONTEXT_ANALYSIS });
                const prompt = buildPrompt(fileData, 'provenance', isReanalysis);
                const response = await analyzeWithSearch(prompt, filesForApi, modelName, googleApiKey);
                result = finalizeProvenanceVerdict(response);
                resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, modelName, isSecondOpinion: isReanalysis } });

            } else { // 'forensic' or 'hybrid'
                modelName = MODELS.PRO;

                let sightengineScore: number | undefined;
                
                // HYBRID FALLBACK STRATEGY
                if (analysisAngle === 'hybrid') {
                    if (!sightengineApiKey) {
                        throw new Error("Sightengine API Key is missing for Hybrid Analysis.");
                    }
                    uiDispatch({ type: actions.START_PIXEL_ANALYSIS });
                     try {
                        const sightengineResult = await analyzeWithSightengine(fileData.imageBase64, sightengineApiKey);
                        sightengineScore = Math.round(sightengineResult.ai_generated * 100);
                    } catch (e) {
                        console.warn("Sightengine Analysis Failed. Falling back to Forensic Analysis.", e);
                    }
                }

                uiDispatch({ type: actions.START_CONTEXT_ANALYSIS });
                const prompt = buildPrompt(fileData, analysisAngle, isReanalysis, sightengineScore);
                const rawResult = await analyzeContent(prompt, filesForApi, modelName, googleApiKey);
                result = finalizeForensicVerdict(rawResult, sightengineScore);
                resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, modelName, isSecondOpinion: isReanalysis } });
            }
            
            uiDispatch({ type: actions.ANALYSIS_COMPLETE });
            
            // HISTORY PERSISTENCE: Save the result to local history
            addToHistory(result, fileData.name, analysisAngle, modelName);

        } catch (error) {
            console.error("Analysis workflow error:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            uiDispatch({ type: actions.SET_ERROR, payload: errorMessage });
        }

    }, [inputState, googleApiKey, sightengineApiKey, resultDispatch, uiDispatch, addToHistory]);

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