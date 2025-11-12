
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
        
        const mandatoryEvidenceDirective = `\n\nMANDATORY: Even if the image contains authentic elements (real people, brands), you MUST still report any and all signs of synthetic creation in your 'highlights'. Signs of synthesis like 'Idealized Perfection' or 'Synthetic Lighting' are primary forensic clues and must not be omitted from the evidence list.`;

        switch (forensicMode) {
            case 'technical':
                evidenceDescription += `\n\nPRIORITY DIRECTIVE: TECHNICAL FORENSICS. Your analysis must be limited to pixel-level evidence. IGNORE the narrative or conceptual elements. You are required to report on: (1) Upscaling & Compression Artifacts, (2) Inconsistent Noise & Grain, (3) Blending & Edge Errors, (4) Impossible Geometry (especially in hands, text, and reflections). CRITICAL JUDGEMENT: High-quality AI re-rendering can produce technically flawless images. The ABSENCE of authentic photographic imperfections (e.g., natural lens distortion, true film grain, subtle chromatic aberration) IS ITSELF the primary technical artifact. You MUST report this 'idealized perfection' as a key technical indicator.`;
                break;
            case 'conceptual':
                 evidenceDescription += `\n\nPRIORITY DIRECTIVE: CONCEPTUAL ANALYSIS. Your analysis must be limited to the context and narrative of the image. IGNORE pixel-level artifacts. You are required to report on: (1) Stylistic & Lighting Consistency, (2) Scene Plausibility & Physics, (3) Cultural or Contextual Anomalies, (4) Narrative Coherence between elements. Pay special attention to signs of era or style mimicry (e.g., a "1950s photo"). Evaluate how authentically the style is replicated, looking for subtle anachronisms in clothing, objects, or photographic quality that a genuine item would not possess.` + mandatoryEvidenceDirective;
                break;
            default: // 'standard'
                evidenceDescription += `\n\nPRIORITY DIRECTIVE: STANDARD ANALYSIS. You must provide a balanced verdict by synthesizing findings from two domains. First, identify key **technical artifacts** (e.g., pixel errors, impossible lighting). Second, identify key **conceptual clues** (e.g., anachronisms, narrative issues). Your final explanation must integrate both to form a single, cohesive conclusion. CRITICAL JUDGEMENT HIERARCHY: Conceptual plausibility is paramount. Anachronisms, idealized perfection, and stylistic inconsistencies MUST take precedence over flawless technical execution in your final verdict. If the scene feels artificial, it IS artificial, regardless of pixel quality.` + mandatoryEvidenceDirective;
                break;
        }
    }

    let modeInstruction = '';
    if (analysisMode === 'deep') {
        modeInstruction = `OUTPUT FORMAT: Conduct a "Deep Dive". Provide a concise explanation and 1-3 specific "highlights" (key indicators). In your 'highlights', you MUST use specific forensic terms like 'Idealized Perfection', 'Anachronistic Photographic Quality', or 'Concealed Hands' when applicable. This is essential for the final report.`;
    } else {
        modeInstruction = `OUTPUT FORMAT: Conduct a "Quick Scan". Identify the two most obvious artifacts.`;
    }
    
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
    
    const highlights = rawResult.highlights || [];
    const explanation = rawResult.explanation || "The model did not provide a detailed explanation.";
    const combinedProse = `${rawResult.verdict} ${explanation} ${highlights.map(h => h.text + ' ' + h.reason).join(' ')}`.toLowerCase();

    // --- "INCONTROVERTIBLE EVIDENCE" MANDATE (THE "TRUMP CARD" RULE) ---
    const TRUMP_CARD_KEYWORDS = new Set([
        'idealized perfection', 'synthetic lighting', 'anachronistic', 'impossible geometry', 
        'concealed hands', 'waxy texture', 'hyper-real', 'unnaturally smooth', 'seamless compositing',
        'flawless edge', 'ai-assisted masking'
    ]);

    for (const highlight of highlights) {
        const evidenceText = `${highlight.text} ${highlight.reason}`.toLowerCase();
        for (const keyword of TRUMP_CARD_KEYWORDS) {
            if (evidenceText.includes(keyword)) {
                // A single piece of incontrovertible evidence ("smoking gun") is found.
                // The verdict is immediately and irrevocably locked.
                return {
                    verdict: "AI-Generated Graphic",
                    probability: 93,
                    explanation,
                    highlights,
                };
            }
        }
    }
    
    // --- If no trump card is found, proceed to the "EVIDENCE-FIRST" TALLY PROTOCOL ---
    const SYNTHETIC_KEYWORDS = new Set([
        'fully generated', 're-creation', 'digital re-rendering', 'ai generation', 'synthetic origin'
    ]);
    
    const AUTHENTIC_KEYWORDS = new Set([
        'natural lighting', 'organic detail', 'plausible anatomy', 'consistent grain', 
        'lens distortion', 'chromatic aberration', 'authentic photographic', 
        'coherent brand identity', 'human-crafted', 'human', 'authentic', 
        'photograph', 'real person', 'natural skin', 'human design', 'real-world',
        'professional studio lighting', 'authentic subject', 'identifiable person'
    ]);

    const GRAPHIC_DESIGN_KEYWORDS = new Set([
        'text overlay', 'branding', 'poster', 'logo', 'graphic design', 
        'promotional graphic', 'typography', 'advertisement', 'layout', 'brand identity',
        'coherent text', 'cohesive branding', 'graphic elements', 'text and logos'
    ]);

    let syntheticScore = 0;
    let authenticScore = 0;

    for (const highlight of highlights) {
        const evidenceText = `${highlight.text} ${highlight.reason}`.toLowerCase();
        for (const keyword of SYNTHETIC_KEYWORDS) if (evidenceText.includes(keyword)) syntheticScore++;
        for (const keyword of AUTHENTIC_KEYWORDS) if (evidenceText.includes(keyword)) authenticScore++;
    }

    let isGraphicDesign = false;
    for (const keyword of GRAPHIC_DESIGN_KEYWORDS) {
        if (combinedProse.includes(keyword)) {
            isGraphicDesign = true;
            break;
        }
    }

    if (syntheticScore > authenticScore && isGraphicDesign) {
        return {
            verdict: "Fully AI-Generated Graphic",
            probability: 93,
            explanation,
            highlights,
        };
    }
    
    if (syntheticScore > authenticScore && syntheticScore > 0) {
        return {
            verdict: "Fully AI-Generated",
            probability: 93,
            explanation,
            highlights,
        };
    }
    
    if (authenticScore > syntheticScore && authenticScore > 0) {
        return {
            verdict: "Appears Human-Crafted",
            probability: 5,
            explanation,
            highlights,
        };
    }
    
    // --- FALLBACK LOGIC ---
    const compositeKeywords = /composite|inserted figures|pasted onto|crude cutouts|digital cutouts|figure integration/i;
    if (compositeKeywords.test(combinedProse) && !isGraphicDesign) { 
        return {
            verdict: "AI-Assisted Composite",
            probability: 65,
            explanation,
            highlights,
        };
    }

    const enhancementKeywords = /enhanced|filter|stylistic|altered|processed|manipulated|styled/i;
    if (enhancementKeywords.test(combinedProse)) {
        return {
            verdict: "AI-Enhanced (Stylistic Filter)",
            probability: 75,
            explanation,
            highlights,
        };
    }

    let probability = Math.round(rawResult.probability || 50);
    let verdict = rawResult.verdict || "Analysis Inconclusive";
    if (/human|not ai/i.test(verdict)) {
        probability = Math.min(probability, 39);
    } else if (/ai/i.test(verdict)) {
        probability = Math.max(probability, 80);
    } else if (/(composite|mixed)/i.test(verdict)) {
        probability = Math.min(Math.max(probability, 40), 79);
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
    
    let modelName: string;
    let filesForApi = fileData;
    
    if (inputType === 'text') {
        modelName = analysisMode === 'deep' ? MODELS.PRO : MODELS.FLASH;
    } else { // 'file'
        analysisMode = 'deep';
        modelName = MODELS.PRO;
        
        filesForApi = await Promise.all(
            fileData.map(async (file) => ({
                ...file,
                imageBase64: await aggressivelyCompressImageForAnalysis(file.imageBase64),
            }))
        );
    }

    const prompt = buildPrompt(inputType, sanitizedText, fileData, analysisMode, forensicMode);
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
