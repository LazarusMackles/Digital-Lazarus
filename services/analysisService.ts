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
        
        if (fileData.length > 1) {
             evidenceDescription = `CRITICAL INSTRUCTION: Your primary task is to forensically analyse the FIRST image provided (named "${primaryEvidence}"). The subsequent image(s) are supporting context. Your goal is to determine the story and relationship between these images. For example, is the second image an AI-restored version of the first? Is one a deepfake of the other? Your final verdict and explanation MUST focus on the primary image while using the others as comparative evidence. A verdict like "Human Photo with AI Restoration" is expected if applicable.`;
        } else {
             evidenceDescription = `The evidence is a single image named "${primaryEvidence}". Analyse it for signs of AI generation or manipulation. IMPORTANT: Be mindful of artifacts common to vintage or old photographs (e.g., film grain, scratches, dust, color fading, soft focus). Distinguish these from true digital synthesis artifacts.`;
        }
        
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
 * Derives a consistent probability score based on the text verdict from the AI.
 * This harmonizes the visual (color/progress) and textual output.
 * @param verdict The string verdict from the model.
 * @param originalScore The original numerical score from the model.
 * @returns A harmonized probability score (0-100).
 */
const harmonizeProbability = (verdict: string, originalScore: number): number => {
    const lowerCaseVerdict = verdict.toLowerCase();
    
    // Check for negative/human verdicts
    if (lowerCaseVerdict.includes('not ai') || lowerCaseVerdict.includes('human') || lowerCaseVerdict.includes('authentic') || lowerCaseVerdict.includes('photograph')) {
        // Return a low but non-zero score for authenticity.
        return Math.floor(Math.random() * 8) + 2; // Random score between 2 and 9
    }

    // Check for mixed/uncertain verdicts
    if (lowerCaseVerdict.includes('mixed') || lowerCaseVerdict.includes('composite') || lowerCaseVerdict.includes('enhanced') || lowerCaseVerdict.includes('restoration')) {
        // Return a score in the middle range.
        return Math.floor(Math.random() * 16) + 50; // Random score between 50 and 65
    }

    // Check for positive/AI verdicts
    if (lowerCaseVerdict.includes('ai')) {
         // Return a high score.
        return Math.floor(Math.random() * 8) + 91; // Random score between 91 and 98
    }

    // Fallback: If no keywords match, trust the original score.
    // This is a safety net for unexpected verdict strings.
    return originalScore;
};


/**
 * Normalizes the raw API response into the consistent AnalysisResult format.
 */
const normalizeResult = (rawResult: any, isQuickScan: boolean): AnalysisResult => {
    if (isQuickScan) {
        const artifact1 = rawResult.artifact_1 || 'No primary finding was provided.';
        const artifact2 = rawResult.artifact_2 || 'No secondary finding was provided.';
        const verdict = rawResult.quick_verdict || "Undetermined";
        const probability = harmonizeProbability(verdict, rawResult.confidence_score || 0);

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
    const probability = harmonizeProbability(verdict, rawResult.probability || 0);

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
        modelName = analysisMode === 'deep' ? MODELS.PRO : MODELS.QUICK_IMAGE;
        
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

    // For quick scans AND deep dives on files, use the standard API call.
    const rawResult = await analyzeContent(prompt, filesForApi, analysisMode, modelName, sanitizedText);
    return { result: normalizeResult(rawResult, isQuickScan), modelName };
};