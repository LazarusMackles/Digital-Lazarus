import { analyzeContent, analyzeContentStream } from '../api/analyze';
import { aggressivelyCompressImageForAnalysis } from '../utils/imageCompression';
import { MODELS } from '../utils/constants';
import { sanitizeTextInput } from '../utils/textUtils';
import type { AnalysisMode, ForensicMode, AnalysisResult, InputType } from '../types';

/**
 * Generates a direct, command-based prompt for the Gemini model.
 */
const buildPrompt = (
    inputType: InputType, 
    textContent: string, 
    fileData: { name: string }[], 
    analysisMode: AnalysisMode,
    forensicMode: ForensicMode
): string => {
    const baseInstruction = `You are a forensic analysis tool. Respond ONLY with a JSON object matching the provided schema. Do not add explanations outside the JSON.`;

    const criticalRule = `CRITICAL RULE: The 'probability' score MUST logically align with the 'verdict' text.
- If verdict is "Human-Crafted" or similar, probability MUST be under 40.
- If verdict is "AI-Enhanced" or "Composite", probability MUST be between 40 and 80.
- If verdict is "Fully AI-Generated", probability MUST be over 80.
This alignment is a primary requirement of your task.`;

    let evidenceDescription = '';
    if (inputType === 'text') {
        evidenceDescription = `ANALYZE TEXT EVIDENCE: Scrutinize the provided text for AI authorship. Focus on style, tone, structure, and content to identify tells like unnatural phrasing, excessive complexity, lack of personal voice, or factual errors.`;
    } else { // 'file'
        const primaryEvidence = fileData[0]?.name || 'the primary image';
        const coreImageDirective = `ANALYZE IMAGE EVIDENCE: Your goal is to find any AI involvement. Assume the image may be an AI-manipulated real photograph. Prioritize finding digital artifacts over the base photo's authenticity.`;
        
        evidenceDescription = `The primary evidence is the image "${primaryEvidence}".\n${coreImageDirective}`;
        if (fileData.length > 1) {
             evidenceDescription = `The primary evidence is the FIRST image ("${primaryEvidence}"). Subsequent images are for supporting context. Your final verdict must focus on the primary image.\n${coreImageDirective}`;
        }

        switch (forensicMode) {
            case 'technical':
                evidenceDescription += `\nFORENSIC ANGLE: Technical analysis ONLY. Report on pixel-level artifacts: compression, impossible lighting, unnatural textures, anatomical errors. IGNORE conceptual elements.`;
                break;
            case 'conceptual':
                 evidenceDescription += `\nFORENSIC ANGLE: Conceptual analysis. Determine if an AI manipulated a real photo. Even if the scene is plausible, you MUST hunt for subtle signs of AI stylization (e.g., unnatural skin, anachronistic lighting, perfect 'vintage' effects).`;
                break;
            default: // 'standard'
                evidenceDescription += `\nFORENSIC ANGLE: Standard analysis. Synthesize BOTH technical artifacts AND conceptual clues into a single, decisive verdict.`;
                break;
        }
    }

    const modeInstruction = analysisMode === 'deep'
        ? `OUTPUT FORMAT: Conduct a "Deep Dive". Provide a concise explanation and 1-3 specific "highlights" (key indicators).`
        : `OUTPUT FORMAT: Conduct a "Quick Scan". Identify the two most obvious artifacts.`;

    return `${baseInstruction}\n\n${criticalRule}\n\n${evidenceDescription}\n\n${modeInstruction}`;
};


/**
 * Normalizes the raw API response into the consistent AnalysisResult format.
 */
const normalizeResult = (rawResult: any, isQuickScan: boolean): AnalysisResult => {
    if (isQuickScan) {
        const artifact1 = rawResult.artifact_1 || 'No primary finding was provided.';
        const artifact2 = rawResult.artifact_2 || 'No secondary finding was provided.';
        const verdict = rawResult.quick_verdict || "Undetermined";
        // DEPRECATED HARMONIZATION: Trust the model's score directly, as per the new command-based prompt.
        const probability = Math.round(rawResult.confidence_score || 0);

        return {
            probability,
            verdict,
            explanation: `My initial scan suggests the verdict based on the following key indicators. For a more detailed analysis, a 'Deep Dive' is recommended.`,
            highlights: [
                { text: 'Primary Finding', reason: artifact1 },
                { text: 'Secondary Finding', reason: artifact2 }
            ],
        };
    }
    
    // Deep scan result
    const verdict = rawResult.verdict || "Analysis Inconclusive";
    // DEPRECATED HARMONIZATION: Trust the model's score directly.
    const probability = Math.round(rawResult.probability || 0);

    return {
        probability,
        verdict,
        explanation: rawResult.explanation,
        highlights: rawResult.highlights || [],
    };
};


/**
 * The main analysis function that prepares data and calls the appropriate API.
 */
export const runAnalysis = async (
    inputType: InputType,
    textContent: string,
    fileData: { name: string; imageBase64: string }[],
    analysisMode: AnalysisMode,
    forensicMode: ForensicMode,
    onStreamUpdate?: (partialExplanation: string) => void
): Promise<{ result: AnalysisResult; modelName: string; }> => {
    
    const sanitizedText = inputType === 'text' ? sanitizeTextInput(textContent) : '';
    const prompt = buildPrompt(inputType, sanitizedText, fileData, analysisMode, forensicMode);
    
    let modelName: string;
    let filesForApi = fileData;
    
    if (inputType === 'text') {
        modelName = analysisMode === 'deep' ? MODELS.PRO : MODELS.FLASH;
    } else { // 'file'
        modelName = MODELS.PRO;
        
        filesForApi = await Promise.all(
            fileData.map(async (file) => ({
                ...file,
                imageBase64: await aggressivelyCompressImageForAnalysis(file.imageBase64),
            }))
        );
    }

    const isQuickScan = analysisMode === 'quick';
    const shouldStream = analysisMode === 'deep' && inputType === 'text';
    
    if (shouldStream && onStreamUpdate) {
        const handleStream = (fullJsonChunk: string) => {
            try {
                const match = fullJsonChunk.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)/);
                if (match && match[1]) {
                    const explanation = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    onStreamUpdate(explanation);
                }
            } catch (e) {
                // Ignore parsing errors on partial chunks
            }
        };
        const rawResult = await analyzeContentStream(prompt, filesForApi, modelName, handleStream, sanitizedText);
        return { result: normalizeResult(rawResult, false), modelName };
    }

    const rawResult = await analyzeContent(prompt, filesForApi, analysisMode, modelName, sanitizedText);
    return { result: normalizeResult(rawResult, isQuickScan), modelName };
};