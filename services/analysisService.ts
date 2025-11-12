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
        const coreImageDirective = `Your primary goal is to find any evidence of AI involvement in the provided image(s).`;
        
        if (fileData.length > 1) {
             evidenceDescription = `The primary evidence is the FIRST image ("${primaryEvidence}"). Subsequent images are for supporting context. Your final verdict must focus on the primary image.\n${coreImageDirective}`;
        } else {
            evidenceDescription = `The primary evidence is the image "${primaryEvidence}".\n${coreImageDirective}`;
        }

        // --- DYNAMIC INSTRUCTION AMPLIFICATION ---
        // This block injects hyper-specific instructions based on the user's selected forensic angle.
        switch (forensicMode) {
            case 'technical':
                evidenceDescription += `\n\nPRIORITY DIRECTIVE: TECHNICAL FORENSICS. Your analysis must be limited to pixel-level evidence. IGNORE the narrative or conceptual elements. You are required to report on: (1) Upscaling & Compression Artifacts, (2) Inconsistent Noise & Grain, (3) Blending & Edge Errors, (4) Impossible Geometry (especially in hands, text, and reflections). CRITICAL JUDGEMENT: High-quality AI re-rendering can produce technically flawless images. The ABSENCE of authentic photographic imperfections (e.g., natural lens distortion, true film grain, subtle chromatic aberration) IS ITSELF the primary technical artifact. You MUST report this 'idealized perfection' as a key technical indicator.`;
                break;
            case 'conceptual':
                 evidenceDescription += `\n\nPRIORITY DIRECTIVE: CONCEPTUAL ANALYSIS. Your analysis must be limited to the context and narrative of the image. IGNORE pixel-level artifacts. You are required to report on: (1) Stylistic & Lighting Consistency, (2) Scene Plausibility & Physics, (3) Cultural or Contextual Anomalies, (4) Narrative Coherence between elements. Pay special attention to signs of era or style mimicry (e.g., a "1950s photo"). Evaluate how authentically the style is replicated, looking for subtle anachronisms in clothing, objects, or photographic quality that a genuine item would not possess. If you conclude the image is a total re-creation, use phrases like 'fully AI-generated recreation' or 'idealized rendering' to ensure the final verdict is accurate.`;
                break;
            default: // 'standard'
                evidenceDescription += `\n\nPRIORITY DIRECTIVE: STANDARD ANALYSIS. You must provide a balanced verdict by synthesizing findings from two domains. First, identify key **technical artifacts** (e.g., pixel errors, impossible lighting). Second, identify key **conceptual clues** (e.g., anachronisms, narrative issues). Your final explanation must integrate both to form a single, cohesive conclusion. CRITICAL JUDGEMENT RULE: If technical evidence appears flawless but conceptual elements seem implausible or stylistically artificial, you MUST give greater weight to the conceptual evidence in your final verdict. If you conclude the image is a total re-creation, use phrases like 'fully AI-generated recreation' or 'idealized rendering' to ensure the final verdict is accurate.`;
                break;
        }
    }

    const modeInstruction = analysisMode === 'deep'
        ? `OUTPUT FORMAT: Conduct a "Deep Dive". Provide a concise explanation and 1-3 specific "highlights" (key indicators).`
        : `OUTPUT FORMAT: Conduct a "Quick Scan". Identify the two most obvious artifacts.`;

    return `${baseInstruction}\n\n${criticalRule}\n\n${evidenceDescription}\n\n${modeInstruction}`;
};


/**
 * The definitive, client-side logic layer that takes a raw, potentially inconsistent AI report
 * and finalizes it into a consistent, logical, and reliable AnalysisResult.
 * This is the new "brain" of the Sleuther.
 * @param rawResult The raw JSON object from the Gemini model.
 * @param isQuickScan A flag indicating if the analysis was a quick scan.
 * @returns A finalized, reliable AnalysisResult object.
 */
const finalizeVerdict = (rawResult: any, isQuickScan: boolean): AnalysisResult => {
    if (isQuickScan) {
        // Quick scan finalization is simpler but still benefits from score clamping.
        const verdict = rawResult.quick_verdict || "Undetermined";
        let probability = Math.round(rawResult.confidence_score || 0);

        // Apply sanity check clamping.
        if (/human|not ai/i.test(verdict) && probability > 39) {
            probability = 39;
        } else if (/ai/i.test(verdict) && probability < 40) {
            probability = 40;
        }

        return {
            probability,
            verdict,
            explanation: `My initial scan suggests the verdict based on the following key indicators. For a more detailed analysis, a 'Deep Dive' is recommended.`,
            highlights: [
                { text: 'Primary Finding', reason: rawResult.artifact_1 || 'No primary finding was provided.' },
                { text: 'Secondary Finding', reason: rawResult.artifact_2 || 'No secondary finding was provided.' }
            ],
        };
    }
    
    // Deep scan finalization logic with hierarchy
    let verdict = rawResult.verdict || "Analysis Inconclusive";
    let probability = Math.round(rawResult.probability || 0);
    const explanation = rawResult.explanation || "The model did not provide a detailed explanation.";
    const highlights = rawResult.highlights || [];
    
    // Create a single string to check for keywords across all relevant fields.
    const combinedText = `${verdict} ${explanation} ${highlights.map(h => `${h.text} ${h.reason}`).join(' ')}`.toLowerCase();

    // --- VERDICT HIERARCHY ---

    // 1. Highest Priority: Check for definitive 'Fully AI-Generated' indicators.
    const fullyGeneratedKeywords = /fully.?generated|re.?creation|anachronistic|idealized perfection|synthetically created|re.?rendering/i;
    if (fullyGeneratedKeywords.test(combinedText)) {
        verdict = "Fully AI-Generated";
        // If the model flags it as fully generated, the score should be high.
        if (probability < 80) {
            probability = 90; // Assign a strong, confident score.
        }
        // Return early to prevent lower-priority rules from interfering.
        return { probability, verdict, explanation, highlights };
    }

    // 2. Middle Priority: Check for 'Enhancement' or 'Filter' indicators.
    const enhancementKeywords = /enhanced|filter|stylistic|altered|processed|manipulated|styled/i;
    if (enhancementKeywords.test(combinedText)) {
        verdict = "AI-Enhanced (Stylistic Filter)";
        probability = 75; // Force the score to a consistent value for this verdict.
        // Return early.
        return { probability, verdict, explanation, highlights };
    }

    // 3. Fallback Score Clamping (General Sanity Check for remaining cases)
    const humanKeywords = /human-crafted|human|authentic|photograph/i;
    
    if (humanKeywords.test(verdict) && probability > 39) {
        probability = 39;
    } else if (/(composite|mixed)/i.test(verdict) && (probability < 40 || probability > 79)) {
        probability = 60; // Clamp composite to a safe middle ground.
    }
    
    // Final catch-all for any verdict containing 'AI' but with a low score.
    if (/ai/i.test(verdict) && probability < 40) {
        probability = 40;
    }

    return {
        probability,
        verdict,
        explanation,
        highlights,
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
        return { result: finalizeVerdict(rawResult, false), modelName };
    }

    const rawResult = await analyzeContent(prompt, filesForApi, analysisMode, modelName, sanitizedText);
    return { result: finalizeVerdict(rawResult, isQuickScan), modelName };
};