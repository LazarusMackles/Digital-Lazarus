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
    // New, more direct base instruction.
    const baseInstruction = `You are a direct-to-point forensic analysis tool. Your ONLY purpose is to detect AI involvement in evidence. You MUST respond ONLY with a JSON object that strictly adheres to the provided schema. Do not add any extra text, markdown, or explanations outside of the JSON structure.`;

    let evidenceDescription = '';
    if (inputType === 'text') {
        // Sharpened text prompt.
        evidenceDescription = `The evidence is a text block. Analyze it for AI authorship. Focus on style, tone, structure, and content. Identify tells like unnatural phrasing, excessive complexity/simplicity, lack of personal voice, or factual hallucinations.`;
    } else { // 'file'
        const primaryEvidence = fileData[0]?.name || 'the primary image';

        // Core directive to prioritize enhancement detection.
        const coreImageDirective = `CRITICAL DIRECTIVE: Assume all images may be AI-enhanced or manipulated. Your primary task is to find evidence of digital alteration. This takes precedence over determining if the underlying photograph is real. Search specifically for artifacts of stylistic filters (e.g., '50s photo effect'), unnatural skin smoothing, anachronistic lighting, inconsistent film grain, or digital brush strokes.`;

        if (fileData.length > 1) {
             evidenceDescription = `Your primary task is to forensically analyse the FIRST image ("${primaryEvidence}"). The subsequent images are for supporting context. Use them for comparison to identify alterations, restorations, or manipulations. Your final verdict must focus on the primary image.\n${coreImageDirective}`;
        } else {
             evidenceDescription = `The evidence is one image ("${primaryEvidence}").\n${coreImageDirective}`;
        }

        // Final, hardened forensic angle prompts.
        switch (forensicMode) {
            case 'technical':
                evidenceDescription += `\nFORENSIC ANGLE: Your analysis MUST be strictly technical. Report ONLY on pixel-level artifacts: compression anomalies, impossible lighting, unnatural textures, anatomical errors (hands, eyes), and digital synthesis patterns. IGNORE all conceptual or narrative elements.`;
                break;
            case 'conceptual':
                evidenceDescription += `\nFORENSIC ANGLE: Focus on conceptual elements. Your primary goal is to determine if an AI has manipulated a real photo. Even if the scene is conceptually plausible, you must still hunt for subtle signs of AI stylization or enhancement. Reference technical details like unnatural skin textures, anachronistic lighting, or overly perfect 'vintage' effects to support your conceptual conclusion.`;
                break;
            default: // 'standard'
                evidenceDescription += `\nFORENSIC ANGLE: Conduct a balanced 'Standard Analysis'. Your goal is to find any AI involvement. You MUST examine BOTH technical artifacts (unnatural textures, lighting flaws, anatomy) AND conceptual clues (anachronisms, plausibility, styling). Synthesize ALL findings into a single, decisive verdict.`;
                break;
        }
    }

    const modeInstruction = analysisMode === 'deep'
        ? `Conduct a "Deep Dive": a thorough, methodical examination. Provide a single, concise summary statement (under 30 words) that introduces the verdict and key indicators, without repeating their content. Then, identify 1-3 specific "highlights" (key indicators) that support your verdict.`
        : `Conduct a "Quick Scan": a rapid, first-pass analysis. Identify the two most obvious artifacts supporting your verdict.`;

    return `${baseInstruction}\n\n**Forensic Checklist:**\n${evidenceDescription}\n\n**Output Format Directive:**\n${modeInstruction}`;
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
    
    // For nuanced verdicts indicating a mix of human and AI, trust the model's score directly.
    // This is the key change to handle AI-enhanced images correctly.
    if (
        lowerCaseVerdict.includes('mixed') || 
        lowerCaseVerdict.includes('composite') || 
        lowerCaseVerdict.includes('enhanced') || 
        lowerCaseVerdict.includes('restoration') || 
        lowerCaseVerdict.includes('assisted') ||
        lowerCaseVerdict.includes('stylistic filter')
    ) {
        // Return the model's score, but cap it to prevent confusion with "fully AI".
        return Math.min(Math.round(originalScore), 85);
    }

    // For clear "Human" verdicts, gently guide the score to the low end.
    if (lowerCaseVerdict.includes('human-crafted') || lowerCaseVerdict.includes('appears authentic') || lowerCaseVerdict.includes('genuine photograph')) {
        // If the model is confident (low score), keep it low. If it's less confident, reflect that.
        return Math.max(Math.min(Math.round(originalScore), 30), 1); // Ensure it's not 0
    }

    // For clear "AI-Generated" verdicts, gently guide the score to the high end.
    if (lowerCaseVerdict.includes('fully ai-generated') || lowerCaseVerdict.includes('digital fabrication')) {
         // If the model is confident (high score), keep it high.
        return Math.min(Math.max(Math.round(originalScore), 85), 100);
    }

    // Fallback: If no specific keywords match, just return the rounded original score.
    // This is a safety net for unexpected verdict strings from the model.
    return Math.round(originalScore);
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
        // FIX: For image analysis, always use the more powerful PRO model to ensure accuracy,
        // even for a 'Quick Scan'. The difference is in the prompt and schema, not the model.
        modelName = MODELS.PRO;
        
        // The PRO model benefits from aggressive compression to speed up analysis.
        // This will now apply to both 'Quick' and 'Deep' image analyses.
        filesForApi = await Promise.all(
            fileData.map(async (file) => ({
                ...file,
                imageBase64: await aggressivelyCompressImageForAnalysis(file.imageBase64),
            }))
        );
    }

    const isQuickScan = analysisMode === 'quick';
    // Text is the only thing that streams for 'deep' mode.
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