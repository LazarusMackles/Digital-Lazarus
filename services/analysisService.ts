
import { analyzeContent, analyzeContentStream, analyzeWithSearch } from '../api/analyze';
import { MODELS } from '../utils/constants';
import { sanitizeTextInput } from '../utils/textUtils';
import type { AnalysisAngle, AnalysisResult, InputType } from '../types';

/**
 * Generates a direct, command-based prompt for the Gemini model.
 */
const buildPrompt = (
    inputType: InputType, 
    textContent: string, 
    fileData: { name: string }[], 
    analysisAngle: AnalysisAngle,
    isReanalysis: boolean,
): string => {
    
    if (analysisAngle === 'provenance') {
        const primaryEvidence = fileData[0]?.name || 'the primary image';
        return `You are a digital content investigator. Using your search tool, investigate the provided image "${primaryEvidence}". Your goal is to determine its provenance: its origin, history of circulation, and if it has been fact-checked by reliable sources. Synthesize your findings into a concise explanation. Respond ONLY with your text summary. Do not add any conversational filler.`;
    }

    // --- Forensic Analysis Prompt ---
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
        
        // --- CORE FORENSIC HEURISTICS ---
        const universalMandate = `UNIVERSAL MANDATE: Your absolute top priority is to identify and report any artifact of digital synthesis. If you observe unnatural perfection, sterile quality, or flawless execution beyond typical photography/graphic design, you MUST report it in the 'highlights' using specific forensic terms like 'Idealized Perfection' or 'Synthetic Lighting'. A core forensic principle is that the ABSENCE of real-world photographic imperfections (e.g., lens distortion, natural skin texture, consistent noise) is, in itself, a primary indicator of digital synthesis. This mandate applies regardless of your primary analysis angle.`;
        const crowdCoherenceProtocol = `CROWD COHERENCE PROTOCOL: When analyzing images with numerous subjects at varying distances (e.g., crowds), you MUST establish the foreground subjects as the 'ground truth' for detail and structure. You MUST differentiate between natural photographic depth-of-field (background blur) and true synthetic failure (malformed foreground details). If foreground elements are coherent and legible (e.g., uniform insignia), you MUST assume that less focused but structurally similar background elements are also authentic. This protocol OVERRIDES any low-level analysis that flags background blur or visual density as a primary synthesis artifact when a coherent foreground is present.`;
        const analogFidelityPrinciple = `ANALOG FIDELITY PRINCIPLE: Correctly interpret signs of authentic physical age and damage. Features like paper creases, fading, dust, scratches, and consistent film grain are strong indicators of a real-world, analog origin and should be treated as evidence FOR authenticity, not as digital flaws.`;
        const restorationArtifactPrinciple = `RESTORATION ARTIFACT PRINCIPLE: Be highly suspicious of images that mix high-fidelity analog textures (like film grain) with areas of unnatural smoothness or clarity. AI restoration often creates tell-tale artifacts: "waxy" or plastic-like skin where wrinkles or blemishes should be, inconsistent noise patterns, and a loss of fine, organic detail in repaired sections. If you detect a mix of authentic vintage qualities and sterile, digitally-repaired patches, you must report it as a strong indicator of AI restoration.`;
        const vintagePhotoHeuristic = `VINTAGE PHOTO HEURISTIC: Be extremely critical of images styled to look like old photographs. Modern AI excels at creating faux-vintage scenes. A key indicator of this is the combination of a vintage aesthetic (clothing, setting, film grain) with modern digital clarity, unnaturally perfect skin, or anachronistic sharpness. If an image looks "too good" for its supposed era, you MUST report this as an 'Anachronistic Photographic Quality' in the highlights.`;
        const computationalPhotoHeuristic = `COMPUTATIONAL PHOTOGRAPHY HEURISTIC: Differentiate between artifacts from Generative AI (creating elements from scratch) and common computational photography techniques (e.g., Portrait Mode bokeh, HDR processing). If you identify computational photography on an otherwise authentic photo, describe it as such (e.g., "The background has a synthetic depth-of-field effect characteristic of smartphone portrait mode.").`;
        
        const coreForensicPrinciples = `${crowdCoherenceProtocol}\n${analogFidelityPrinciple}\n${restorationArtifactPrinciple}\n${vintagePhotoHeuristic}\n${computationalPhotoHeuristic}`;
        
        evidenceDescription = `ANALYZE IMAGE EVIDENCE: Your primary goal is to find any evidence of AI involvement in the image "${primaryEvidence}".\n\n${universalMandate}\n\nCORE FORENSIC PRINCIPLES:\n${coreForensicPrinciples}`;

        if (fileData.length > 1) {
            evidenceDescription += `\n\nSubsequent images are for supporting context only. Your final verdict must focus on the primary image.`;
        }

        if(isReanalysis) {
            evidenceDescription += `\n\nPRIORITY DIRECTIVE: SECOND OPINION. Re-evaluate the evidence with maximum scrutiny. Challenge your initial assumptions and look for subtle clues you may have missed. The user is questioning your first analysis, so provide a deeper, more critical perspective.`;
        } else {
             evidenceDescription += `\n\nPRIORITY DIRECTIVE: STANDARD ANALYSIS. This analysis is governed by the Universal Mandate and Core Forensic Principles. Your task is to find any evidence of AI, prioritizing forensic, technical evidence over conceptual plausibility. A plausible concept (e.g., a vintage photo) presented with unnatural, sterile perfection is a strong indicator of AI synthesis. The ABSENCE of real-world photographic imperfections (e.g., lens distortion, natural skin texture, consistent noise) is itself a primary clue. You MUST report these if found.`;
        }
    }
    
    const modeInstruction = `OUTPUT FORMAT: Conduct a "Deep Dive". Provide a concise explanation and 1-3 specific "highlights" (key indicators). In your 'highlights', you MUST use specific forensic terms like 'Idealized Perfection', 'Anachronistic Photographic Quality', or 'Concealed Hands' when applicable. This is essential for the final report.`;
    
    return `${baseInstruction}\n\n${criticalRule}\n\n${evidenceDescription}\n\n${modeInstruction}`;
};


/**
 * The definitive, client-side logic layer that takes a raw, potentially inconsistent AI report
 * and finalizes it into a consistent, logical, and reliable AnalysisResult.
 * This is the new "brain" of the Sleuther.
 * @param rawResult The raw JSON object from the Gemini model.
 * @returns A finalized, reliable AnalysisResult object.
 */
const finalizeForensicVerdict = (rawResult: any): AnalysisResult => {
    
    const highlights = rawResult.highlights || [];
    const explanation = rawResult.explanation || "The model did not provide a detailed explanation.";
    let verdict = rawResult.verdict || "Analysis Inconclusive";
    let probability = Math.round(rawResult.probability || 50);

    const combinedProse = `${verdict} ${explanation} ${highlights.map((h:any) => h.text + ' ' + h.reason).join(' ')}`.toLowerCase();
    
    // --- RULE 0: CROWD EXEMPTION PROTOCOL (TOP PRIORITY) ---
    const CROWD_AUTHENTICITY_KEYWORDS = new Set([
        'coherent crowd', 
        'coherent uniform',
        'legible name tapes',
        'natural focus fall-off', 
        'photographic depth of field',
    ]);

    for (const highlight of highlights) {
        const evidenceText = `${highlight.text} ${highlight.reason}`.toLowerCase();
        for (const keyword of CROWD_AUTHENTICITY_KEYWORDS) {
            if (evidenceText.includes(keyword)) {
                return {
                    verdict: "Human Enhanced Photograph",
                    probability: 15,
                    explanation: "This appears to be an authentic photograph of a complex crowd scene. Key details are coherent, and background blur is consistent with natural photographic depth-of-field. Minor digital enhancements may be present.",
                    highlights,
                };
            }
        }
    }
    
    // --- KEYWORD DEFINITIONS ---
    const PERFECTION_KEYWORDS = new Set([
        'flawless', 'perfect', 'idealized', 'sterile', 'unnaturally', 
        'uniform', 'waxy', 'plastic-like', 'without error', 'no imperfections'
    ]);
    const AUTHENTICITY_KEYWORDS = new Set([
        'authentic', 'natural skin', 'realistic texture', 'genuine photograph', 'real camera', 
        'real person', 'fine pores', 'wrinkles', 'age-appropriate', 'natural lighting',
        'consistent lighting', 'organic detail'
    ]);
    const SUBJECT_KEYWORDS = new Set([
        'photograph', 'portrait', 'person', 'subject', 'woman', 'man', 'figure'
    ]);
    const COMPUTATIONAL_PHOTO_KEYWORDS = new Set([
        'bokeh', 'portrait mode', 'synthetic depth of field', 'shallow depth of field', 
        'background blur', 'computationally', 'computational photography', 'smartphone portrait'
    ]);
    const ANALOG_KEYWORDS = new Set([
        'film grain', 'analog', 'vintage', '1980s', '1990s', 'film print', 'scanned photo', 'paper texture',
    ]);

    const hasPerfectionTerm = [...PERFECTION_KEYWORDS].some(k => combinedProse.includes(k));
    const hasAuthenticityTerm = [...AUTHENTICITY_KEYWORDS].some(k => combinedProse.includes(k));
    const isPhotographicSubject = [...SUBJECT_KEYWORDS].some(k => combinedProse.includes(k));
    const hasComputationalTerm = [...COMPUTATIONAL_PHOTO_KEYWORDS].some(k => combinedProse.includes(k));
    const hasAnalogTerm = [...ANALOG_KEYWORDS].some(k => combinedProse.includes(k));

    // --- RULE 1: ANALOG PHOTO OVERRIDE ---
    if (hasAnalogTerm) {
        return {
            verdict: "Human Enhanced Photograph",
            probability: 15,
            explanation: "This appears to be an authentic analog photograph that has been digitized. Its qualities are consistent with a scanned film photo that may have undergone digital enhancements like cropping or color correction.",
            highlights,
        };
    }

    // --- RULE 2: COMPUTATIONAL PHOTOGRAPHY DETECTION ---
    if (isPhotographicSubject && hasAuthenticityTerm && hasComputationalTerm && !hasAnalogTerm) {
        return {
            verdict: "Human Enhanced Photograph",
            probability: 15, // Low probability, as the core photo is real.
            explanation: "This appears to be an authentic photograph enhanced by computational techniques, such as an artificial background blur (Portrait Mode), common in modern smartphone photography.",
            highlights,
        };
    }

    // --- RULE 3: THE INFALLIBILITY GAMBIT (SEMANTIC CONTRADICTION DETECTION) ---
    if (isPhotographicSubject && hasPerfectionTerm && hasAuthenticityTerm && !hasComputationalTerm) {
        return {
            verdict: "AI-Generated Graphic",
            probability: 93,
            explanation: "The analysis revealed a critical contradiction: the image was described with terms of both authentic photography (e.g., natural skin, real lighting) and unnatural perfection. This logical inconsistency is a strong indicator of a sophisticated AI-generated image designed to mimic reality.",
            highlights,
        };
    }

    // --- RULE 4: "INCONTROVERTIBLE EVIDENCE" MANDATE (THE "TRUMP CARD" RULE) ---
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
    
    // --- RULE 5: "EVIDENCE-FIRST" TALLY PROTOCOL ---
    const SYNTHETIC_KEYWORDS = new Set([
        'ai-generated', 'fully generated', 're-creation', 'digital re-rendering', 'ai generation', 'synthetic origin', 'synthetic creation',
        'synthetic lighting and detail', 'idealized perfection in portrait'
    ]);
    const AUTHENTIC_KEYWORDS_TALLY = new Set([
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
        for (const keyword of AUTHENTIC_KEYWORDS_TALLY) if (evidenceText.includes(keyword)) authenticScore++;
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
    
    // --- FALLBACK RULES ---
    const restorationKeywords = /restored|repaired|inpainted|denoised|colorized|cleaned|digitally repaired|artifact removal/i;
    if (restorationKeywords.test(combinedProse)) {
        return {
            verdict: "Likely AI-Restored",
            probability: 70, // A specific score indicating significant modification
            explanation,
            highlights,
        };
    }

    const compositeKeywords = /composite|inserted figures|pasted onto|crude cutouts|digital cutouts|figure integration/i;
    if (compositeKeywords.test(combinedProse)) { 
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
 * Finalizes the verdict for a provenance (search-grounded) analysis.
 * @param response The full response object from the Gemini API.
 * @returns A finalized AnalysisResult object.
 */
const finalizeProvenanceVerdict = (response: any): AnalysisResult => {
    const explanation = response.text?.trim() || "The investigation did not return a conclusive summary.";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    let verdict = "Provenance Dossier";
    if (groundingMetadata?.groundingChunks?.length > 0) {
        const fullText = explanation.toLowerCase();
        if (fullText.includes("ai-generated") || fullText.includes("fake") || fullText.includes("fabricated")) {
            verdict = "AI-Generated (Debunked)";
        } else if (fullText.includes("authentic") || fullText.includes("real photo")) {
            verdict = "Authentic (Verified)";
        }
    } else {
        verdict = "No Online History Found";
    }

    return {
        probability: 0, // Probability is not relevant for this type of analysis
        verdict,
        explanation,
        highlights: [],
        groundingMetadata,
    };
};


/**
 * The main analysis function that prepares data and calls the appropriate API.
 */
export const runAnalysis = async (
    inputType: InputType,
    textContent: string,
    fileData: { name: string; imageBase64: string }[],
    analysisAngle: AnalysisAngle,
    onStreamUpdate?: (partialExplanation: string) => void,
    isReanalysis: boolean = false
): Promise<{ result: AnalysisResult; modelName: string; }> => {
    
    const sanitizedText = inputType === 'text' ? sanitizeTextInput(textContent) : '';
    
    const modelName = MODELS.PRO;
    const filesForApi = fileData;
    
    const prompt = buildPrompt(inputType, sanitizedText, fileData, analysisAngle, isReanalysis);
    
    if (analysisAngle === 'provenance') {
        const response = await analyzeWithSearch(prompt, filesForApi, modelName);
        return { result: finalizeProvenanceVerdict(response), modelName };
    }

    // --- Forensic Analysis Path ---
    const shouldStream = inputType === 'text'; // Only stream text for forensic analysis
    
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
        return { result: finalizeForensicVerdict(rawResult), modelName };
    }

    const rawResult = await analyzeContent(prompt, filesForApi, modelName, sanitizedText);
    return { result: finalizeForensicVerdict(rawResult), modelName };
};
