
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
        const universalMandate = `UNIVERSAL MANDATE: Your absolute top priority is to identify and report any artifact of digital synthesis. If you observe unnatural perfection, sterile quality, or flawless execution beyond typical photography/graphic design, you MUST report it in the 'highlights' using specific forensic terms like 'Idealized Perfection' or 'Synthetic Lighting'. A core forensic principle is that the ABSENCE of real-world photographic imperfections (e.g., lens distortion, natural skin texture, consistent noise) is, in itself, a primary indicator of digital synthesis. This mandate applies regardless of your primary analysis angle.`;
        const analogFidelityPrinciple = `ANALOG FIDELITY PRINCIPLE: Correctly interpret signs of authentic physical age and damage. Features like paper creases, fading, dust, scratches, and consistent film grain are strong indicators of a real-world, analog origin and should be treated as evidence FOR authenticity, not as digital flaws.`;
        const restorationArtifactPrinciple = `RESTORATION ARTIFACT PRINCIPLE: Be highly suspicious of images that mix high-fidelity analog textures (like film grain) with areas of unnatural smoothness or clarity. AI restoration often creates tell-tale artifacts: "waxy" or plastic-like skin where wrinkles or blemishes should be, inconsistent noise patterns, and a loss of fine, organic detail in repaired sections. If you detect a mix of authentic vintage qualities and sterile, digitally-repaired patches, you must report it as a strong indicator of AI restoration.`;
        const vintagePhotoHeuristic = `VINTAGE PHOTO HEURISTIC: Be extremely critical of images styled to look like old photographs. Modern AI excels at creating faux-vintage scenes. A key indicator of this is the combination of a vintage aesthetic (clothing, setting, film grain) with modern digital clarity, unnaturally perfect skin, or anachronistic sharpness. If an image looks "too good" for its supposed era, you MUST report this as an 'Anachronistic Photographic Quality' in the highlights.`;
        
        evidenceDescription = `ANALYZE IMAGE EVIDENCE: Your primary goal is to find any evidence of AI involvement in the image "${primaryEvidence}".\n\n${universalMandate}`;

        if (fileData.length > 1) {
            evidenceDescription += `\nSubsequent images are for supporting context only. Your final verdict must focus on the primary image.`;
        }
        
        switch (forensicMode) {
            case 'technical':
                evidenceDescription += `\n\nPRIORITY DIRECTIVE: TECHNICAL FORENSICS. Ignore conceptual and narrative elements. Your analysis is strictly limited to pixel-level evidence: upscaling artifacts, inconsistent lighting, blending errors, impossible geometry, and unnatural sharpness.`;
                break;
            case 'conceptual':
                evidenceDescription += `\n\nPRIORITY DIRECTIVE: CONCEPTUAL ANALYSIS. While your primary focus is on the narrative and context, you must still adhere to the Universal Mandate and report any and all signs of digital synthesis you observe. Your analysis is strictly limited to the narrative and context: stylistic consistency, scene plausibility, cultural anachronisms, and logical coherence. A plausible concept presented with unnatural, sterile perfection is a strong indicator of AI-assisted design.\n${analogFidelityPrinciple}\n${restorationArtifactPrinciple}\n${vintagePhotoHeuristic}`;
                break;
            default: // 'standard'
                evidenceDescription += `\n\nPRIORITY DIRECTIVE: STANDARD ANALYSIS. This analysis is governed by the Universal Mandate. Your task is to find any evidence of AI, prioritizing forensic, technical evidence over conceptual plausibility. A plausible concept (e.g., a vintage photo) presented with unnatural, sterile perfection is a strong indicator of AI synthesis. The ABSENCE of real-world photographic imperfections (e.g., lens distortion, natural skin texture, consistent noise) is itself a primary clue. You MUST report these if found.\n${analogFidelityPrinciple}\n${restorationArtifactPrinciple}\n${vintagePhotoHeuristic}`;
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
    let verdict = rawResult.verdict || "Analysis Inconclusive";
    let probability = Math.round(rawResult.probability || 50);

    const combinedProse = `${verdict} ${explanation} ${highlights.map(h => h.text + ' ' + h.reason).join(' ')}`.toLowerCase();

    // --- "INCONTROVERTIBLE EVIDENCE" MANDATE (THE "TRUMP CARD" RULE) ---
    const TRUMP_CARD_KEYWORDS = new Set([
        'idealized perfection', 'synthetic lighting', 'anachronistic', 'impossible geometry', 
        'concealed hands', 'waxy texture', 'hyper-real', 'unnaturally smooth', 'seamless compositing',
        'flawless edge', 'ai-assisted masking', 'unnatural perfection', 'sterile quality', 'hyper-sharp edges'
    ]);

    for (const highlight of highlights) {
        const evidenceText = `${highlight.text} ${highlight.reason}`.toLowerCase();
        for (const keyword of TRUMP_CARD_KEYWORDS) {
            if (evidenceText.includes(keyword)) {
                return {
                    verdict: "AI-Generated Graphic",
                    probability: 93,
                    explanation,
                    highlights,
                };
            }
        }
    }
    
    const GRAPHIC_DESIGN_KEYWORDS = new Set([
        'text overlay', 'branding', 'poster', 'logo', 'graphic design', 
        'promotional graphic', 'typography', 'advertisement', 'layout', 'brand identity',
        'coherent text', 'cohesive branding', 'graphic elements', 'text and logos', 'professional composite', 'graphic overlays'
    ]);

    const isGraphicDesign = [...GRAPHIC_DESIGN_KEYWORDS].some(k => combinedProse.includes(k));

    // --- "ZERO TOLERANCE" PROTOCOL (THE SEMANTIC JUDGE) ---
    const AUTHENTICITY_ADJECTIVES = new Set([
        'authentic', 'natural', 'realistic', 'consistent', 'coherent', 'naturalistic', 'conventional', 'detailed', 'professional'
    ]);
    const PHOTOGRAPHIC_NOUNS = new Set([
        'photograph', 'portrait', 'texture', 'lighting', 'skin', 'hair', 'detail', 'aging', 'asymmetry', 'wrinkles', 'pores', 'fabric', 'stubble', 'portraiture'
    ]);

    if (isGraphicDesign) {
        for (const highlight of highlights) {
            const evidenceText = `${highlight.text} ${highlight.reason}`.toLowerCase();
            const hasAdjective = [...AUTHENTICITY_ADJECTIVES].some(adj => evidenceText.includes(adj));
            const hasNoun = [...PHOTOGRAPHIC_NOUNS].some(noun => evidenceText.includes(noun));

            if (hasAdjective && hasNoun) {
                // CONTRADICTION FOUND: AI is describing a synthetic graphic using language reserved for authentic photos.
                // This is a primary indicator of a sophisticated fake.
                return {
                    verdict: "AI-Generated Graphic",
                    probability: 93,
                    explanation,
                    highlights,
                };
            }
        }
    }
    
    // --- "EVIDENCE-FIRST" TALLY PROTOCOL ---
    const SYNTHETIC_KEYWORDS = new Set([
        'ai-generated', 'fully generated', 're-creation', 'digital re-rendering', 'ai generation', 'synthetic origin', 'synthetic creation',
        'synthetic lighting and detail', 'idealized perfection in portrait'
    ]);
    const AUTHENTIC_KEYWORDS = new Set([
        'natural lighting', 'organic detail', 'plausible anatomy', 'consistent grain', 'lens distortion', 
        'chromatic aberration', 'authentic photographic', 'human-crafted', 'human', 'authentic', 'photograph', 
        'real person', 'natural skin', 'human design', 'real-world', 'professional studio lighting', 
        'authentic subject', 'identifiable person', 'verifiable public figure', 'fine skin texture',
        'crease', 'fading', 'discoloration', 'physical damage', 'dust', 'scratches', 'analog', 'film grain',
        'paper texture', 'emulsion damage'
    ]);

    let syntheticScore = 0;
    let authenticScore = 0;

    for (const highlight of highlights) {
        const evidenceText = `${highlight.text} ${highlight.reason}`.toLowerCase();
        for (const keyword of SYNTHETIC_KEYWORDS) if (evidenceText.includes(keyword)) syntheticScore++;
        for (const keyword of AUTHENTIC_KEYWORDS) if (evidenceText.includes(keyword)) authenticScore++;
    }

    if (isGraphicDesign && syntheticScore > 0) {
        return {
            verdict: "AI-Generated Graphic",
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
    
    // --- RESTORATION DETECTION PROTOCOL ---
    const restorationKeywords = /restored|repaired|inpainted|denoised|colorized|cleaned|digitally repaired|artifact removal/i;
    if (restorationKeywords.test(combinedProse)) {
        return {
            verdict: "Likely AI-Restored",
            probability: 70, // A specific score indicating significant modification
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

    // --- Final Probability Clamping as last resort ---
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
