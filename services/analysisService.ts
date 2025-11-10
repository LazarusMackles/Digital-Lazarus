
import { analyzeContent, analyzeContentStream } from '../api/analyze';
import { aggressivelyCompressImageForAnalysis } from '../utils/imageCompression';
import { MODELS } from '../utils/constants';
import { sanitizeTextInput } from '../utils/textUtils';
import type { AnalysisMode, ForensicMode, AnalysisResult, InputType } from '../types';

/**
 * Generates a detailed, context-aware prompt for the Gemini model.
 */
const buildPrompt = (
    inputType: InputType, 
    textContent: string, 
    fileData: { name: string }[], 
    analysisMode: AnalysisMode,
    forensicMode: ForensicMode
): string => {
    
    const baseInstruction = `You are "Sleuther Vanguard," a world-class digital forensics expert specialising in identifying AI-generated or AI-manipulated content. Your tone is professional, insightful, and slightly dramatic, like a classic detective. Your goal is to provide a clear, evidence-based verdict. Respond ONLY with the JSON object matching the provided schema. Do not add any extra text or markdown formatting.`;

    let evidenceDescription = '';
    if (inputType === 'text') {
        evidenceDescription = `The evidence is the following text block. Analyse its style, tone, structure, and content to determine if it was written by an AI. Look for tells like unnatural phrasing, excessive complexity or simplicity, lack of personal voice, or factual hallucinations. Even for very short text, analyse jargon and structure.`;
    } else { // 'file'
        const primaryEvidence = fileData[0]?.name || 'the primary image';
        const supportingEvidence = fileData.length > 1 
            ? ` It is supported by ${fileData.length - 1} other image(s) for context.`
            : '';
        evidenceDescription = `The primary evidence is an image named "${primaryEvidence}".${supportingEvidence} Analyse it for signs of AI generation or manipulation.`;
        
        switch (forensicMode) {
            case 'technical':
                evidenceDescription += ` Focus your analysis STRICTLY on technical artifacts: pixel inconsistencies, impossible lighting, unnatural textures, anatomical errors (especially hands/eyes), and signs of digital synthesis. Ignore the conceptual elements.`;
                break;
            case 'conceptual':
                evidenceDescription += ` Focus your analysis STRICTLY on conceptual elements: the story, context, and plausibility of the scene. Ignore minor technical artifacts unless they are narratively significant.`;
                break;
            default: // 'standard'
                evidenceDescription += ` Conduct a balanced analysis, considering both technical artifacts (pixels, lighting, anatomy) and conceptual elements (story, context, plausibility).`;
                break;
        }
    }

    const modeInstruction = analysisMode === 'deep'
        ? `Conduct a "Deep Dive": a thorough, methodical examination. Provide a single, concise summary statement (under 30 words) that introduces the verdict and key indicators, without repeating their content. Then, identify 1-3 specific "highlights" (key indicators) that support your verdict.`
        : `Conduct a "Quick Scan": a rapid, first-pass analysis. Identify the two most obvious artifacts supporting your verdict.`;

    return `${baseInstruction}\n\n**Case File:**\n${evidenceDescription}\n\n**Deductive Method:**\n${modeInstruction}`;
};

/**
 * Normalizes the raw API response into the consistent AnalysisResult format.
 */
const normalizeResult = (rawResult: any, isQuickScan: boolean): AnalysisResult => {
    if (isQuickScan) {
        const artifact1 = rawResult.artifact_1 || 'No primary finding was provided.';
        const artifact2 = rawResult.artifact_2 || 'No secondary finding was provided.';

        return {
            probability: rawResult.confidence_score,
            verdict: rawResult.quick_verdict,
            explanation: `My initial scan suggests the verdict based on the following key indicators. For a more detailed analysis, a 'Deep Dive' is recommended.`,
            highlights: [
                { text: 'Primary Finding', reason: artifact1 },
                { text: 'Secondary Finding', reason: artifact2 }
            ],
        };
    }
    // Deep scan result should already match the AnalysisResult format.
    return {
        probability: rawResult.probability,
        verdict: rawResult.verdict,
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
    
    if (inputType === 'file') {
        modelName = analysisMode === 'deep' ? MODELS.PRO : MODELS.QUICK_IMAGE;
        // For the more powerful Pro model, we can use higher-res images.
        // For the quick model, we compress aggressively to ensure speed.
        if (analysisMode === 'quick') {
            filesForApi = await Promise.all(
                fileData.map(async (file) => ({
                    ...file,
                    imageBase64: await aggressivelyCompressImageForAnalysis(file.imageBase64),
                }))
            );
        }
    } else { // 'text'
        // For text, we use the faster model for quick scans and the more powerful one for deep dives.
        modelName = analysisMode === 'deep' ? MODELS.PRO : MODELS.FLASH;
    }

    const isQuickScan = analysisMode === 'quick';
    
    // For deep dives (always streaming), use the streaming API call.
    if (analysisMode === 'deep' && onStreamUpdate) {
        let fullResponseText = '';
        const handleStream = (chunkText: string) => {
            fullResponseText += chunkText;
            try {
                // Find the explanation field in the potentially incomplete JSON string.
                const match = fullResponseText.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)/);
                if (match && match[1]) {
                    // Clean up escaped characters for display
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

    // For quick scans, use the standard API call.
    const rawResult = await analyzeContent(prompt, filesForApi, analysisMode, modelName, sanitizedText);
    return { result: normalizeResult(rawResult, isQuickScan), modelName };
};
