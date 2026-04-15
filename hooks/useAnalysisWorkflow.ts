
import { useCallback } from 'react';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import { useUIState } from '../context/UIStateContext';
import { useHistory } from '../context/HistoryContext';
import * as actions from '../context/actions';
import { 
    buildPrompt, 
    finalizeForensicVerdict 
} from '../services/analysisService';
import { analyzeWithHive } from '../services/hiveService';
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
    const { googleApiKey, hiveAccessKey, hiveSecretKey, hasHiveKeys } = useApiKeys();

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
                throw new Error("Google API Key is missing. Please complete the Vanguard Onboarding.");
            }

            if (!hasHiveKeys) {
                throw new Error("Hive API Keys are missing. Please complete the Vanguard Onboarding.");
            }

            // PERFORMANCE OPTIMIZATION: Compress image before sending to API to reduce latency.
            const compressedImage = await aggressivelyCompressImageForAnalysis(fileData.imageBase64);
            const filesForApi = [{ name: fileData.name, imageBase64: compressedImage }];

            let result, modelName;

            modelName = MODELS.PRO;

            let pixelScore: number | undefined;
            let groundingMetadata: any | undefined;
            let provenanceData: string | undefined;
            
            // HYBRID ANALYSIS: The Vanguard Protocol
            if (analysisAngle === 'hybrid') {
                // Step 1: Pixel Analysis (Math)
                uiDispatch({ type: actions.START_PIXEL_ANALYSIS });
                try {
                    pixelScore = await analyzeWithHive(fileData.imageBase64, hiveAccessKey!, hiveSecretKey!);
                } catch (e) {
                    console.warn("Pixel Analysis Failed. Falling back to Cognitive Analysis.", e);
                }

                // Step 2: Truth Anchor (Silent Background Search)
                // We use Flash for speed for the silent search
                try {
                    const searchPrompt = `Investigate the provenance of this image. Look for specific photographer attributions, film branding (like Kodak), or known viral history. Respond with a concise summary.`;
                    const searchResponse = await analyzeWithSearch(searchPrompt, filesForApi, MODELS.FLASH, googleApiKey);
                    groundingMetadata = searchResponse.candidates?.[0]?.groundingMetadata;
                    provenanceData = searchResponse.text;
                } catch (e) {
                    console.warn("Truth Anchor search failed. Proceeding without provenance data.", e);
                }
            }

            // Step 3: Cognitive Analysis (Physics & Logic)
            uiDispatch({ type: actions.START_CONTEXT_ANALYSIS });
            const prompt = buildPrompt(fileData, analysisAngle, isReanalysis, pixelScore, provenanceData);
            const rawResult = await analyzeContent(prompt, filesForApi, modelName, googleApiKey);
            result = finalizeForensicVerdict(rawResult, pixelScore, groundingMetadata);
            
            resultDispatch({ type: actions.ANALYSIS_SUCCESS, payload: { result, modelName, isSecondOpinion: isReanalysis } });
            
            uiDispatch({ type: actions.ANALYSIS_COMPLETE });
            
            // HISTORY PERSISTENCE: Save the result to local history
            addToHistory(result, fileData.name, analysisAngle, modelName);

        } catch (error) {
            console.error("Analysis workflow error:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            uiDispatch({ type: actions.SET_ERROR, payload: errorMessage });
        }

    }, [inputState, googleApiKey, hiveAccessKey, hiveSecretKey, hasHiveKeys, resultDispatch, uiDispatch, addToHistory]);

    const handleNewAnalysis = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        uiDispatch({ type: actions.RESET_ANALYSIS_STATE });
        window.scrollTo(0, 0);
    }, [resultDispatch, uiDispatch]);

    const handleReset = useCallback(() => {
        resultDispatch({ type: actions.NEW_ANALYSIS });
        inputDispatch({ type: actions.CLEAR_INPUTS });
        uiDispatch({ type: actions.RESET_ANALYSIS_STATE });
        window.scrollTo(0, 0);
    }, [resultDispatch, inputDispatch, uiDispatch]);
    
    const handleClearInputs = useCallback(() => {
        inputDispatch({ type: actions.CLEAR_INPUTS });
        uiDispatch({ type: actions.CLEAR_ERROR });
        window.scrollTo(0, 0);
    }, [inputDispatch, uiDispatch]);

    return { performAnalysis, handleNewAnalysis, handleClearInputs, handleReset };
};