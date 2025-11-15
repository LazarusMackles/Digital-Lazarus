import { analyzeContent, analyzeWithSearch } from '../api/analyze';
import { analyzeWithSightengine } from './sightengineService';
import { MODELS } from '../utils/constants';
import type { AnalysisAngle, AnalysisResult } from '../types';

/**
 * Generates a direct, command-based prompt for the Gemini model.
 */
export const buildPrompt = (
    fileData: { name: string } | null, 
    analysisAngle: AnalysisAngle,
    isReanalysis: boolean,
    sightengineScore?: number,
): string => {
    
    if (analysisAngle === 'provenance') {
        const primaryEvidence = fileData?.name || 'the provided image';
        return `You are a digital content investigator. Using your search tool, investigate the provided image "${primaryEvidence}". Your goal is to determine its provenance. Synthesize your findings into a concise summary of **no more than 5 key bullet points**. The **very first bullet point** MUST be a definitive statement confirming if the image has been widely debunked as AI-generated or verified as authentic by fact-checkers. CRITICAL FORMATTING RULE: Your entire response MUST be a bulleted list, with each point starting with a hyphen (-). Do not add any conversational filler, introductory text, or a heading. Respond ONLY with the bulleted list.`;
    }

    // --- Forensic & Hybrid Analysis Prompts ---
    let baseInstruction = `You are a forensic analysis tool. Respond ONLY with a JSON object matching the provided schema. Do not add explanations outside the JSON.`;
    
    if (analysisAngle === 'hybrid' && sightengineScore !== undefined) {
         baseInstruction += `\n\nCONTEXT: An initial, specialized pixel analysis by Sightengine has returned a ${sightengineScore}% probability that this image is AI-generated. Your primary task is to find the specific visual evidence that either supports or contradicts this finding.`;
    }

    const criticalRule = `CRITICAL RULE: The 'probability' score MUST logically align with the 'verdict' text.
- If verdict is "Human-Crafted" or similar, probability MUST be under 40.
- If verdict is "AI-Enhanced" or "Composite", probability MUST be between 40 and 80.
- If verdict is "Fully AI-Generated", probability MUST be over 80.
This alignment is a primary requirement of your task.`;

    const primaryEvidence = fileData?.name || 'the provided image';
    const universalMandate = `UNIVERSAL MANDATE: Your absolute top priority is to identify and report any artifact of digital synthesis. If you observe unnatural perfection, sterile quality, or flawless execution beyond typical photography/graphic design, you MUST report it in the 'highlights' using specific forensic terms like 'Idealized Perfection' or 'Synthetic Lighting'. A core forensic principle is that the ABSENCE of real-world photographic imperfections (e.g., lens distortion, natural skin texture, consistent noise) is, in itself, a primary indicator of digital synthesis. This mandate applies regardless of your primary analysis angle.`;
    
    let evidenceDescription = `ANALYZE IMAGE EVIDENCE: Your primary goal is to find any evidence of AI involvement in the image "${primaryEvidence}".\n\n${universalMandate}`;

    if(isReanalysis) {
        evidenceDescription += `\n\nPRIORITY DIRECTIVE: SECOND OPINION. Re-evaluate the evidence with maximum scrutiny. Challenge your initial assumptions and look for subtle clues you may have missed. The user is questioning your first analysis, so provide a deeper, more critical perspective.`;
    } else {
         evidenceDescription += `\n\nPRIORITY DIRECTIVE: STANDARD ANALYSIS. Your task is to find any evidence of AI, prioritizing forensic, technical evidence over conceptual plausibility. The ABSENCE of real-world photographic imperfections is itself a primary clue. You MUST report these if found.`;
    }
    
    const modeInstruction = `OUTPUT FORMAT: Conduct a "Deep Dive". Provide a concise explanation and 1-3 specific "highlights" (key indicators).`;
    
    return `${baseInstruction}\n\n${criticalRule}\n\n${evidenceDescription}\n\n${modeInstruction}`;
};


export const finalizeForensicVerdict = (rawResult: any, sightengineScore?: number): AnalysisResult => {
    let probability = sightengineScore !== undefined ? sightengineScore : Math.round(rawResult.probability || 50);
    let verdict = rawResult.verdict || "Analysis Inconclusive";
    const explanation = rawResult.explanation || "The model did not provide a detailed explanation.";
    const highlights = rawResult.highlights || [];

    // If using Sightengine's score, align the verdict to it.
    if (sightengineScore !== undefined) {
        if (sightengineScore > 80) verdict = "Fully AI-Generated";
        else if (sightengineScore > 40) verdict = "Likely AI-Enhanced";
        else verdict = "Appears Human-Crafted";
    }

    // --- Final Probability Clamping as last resort ---
    if (/human|not ai|authentic/i.test(verdict)) {
        probability = Math.min(probability, 39);
    } else if (/ai/i.test(verdict)) {
        probability = Math.max(probability, 80);
    } else if (/(composite|mixed|enhanced)/i.test(verdict)) {
        probability = Math.min(Math.max(probability, 40), 79);
    }

    return {
        probability,
        verdict,
        explanation,
        highlights,
    };
};

export const finalizeProvenanceVerdict = (response: any): AnalysisResult => {
    const explanation = response.text?.trim() || "The investigation did not return a conclusive summary.";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    let verdict = "Provenance Dossier"; // Default verdict
    if (groundingMetadata?.groundingChunks?.length > 0) {
        const fullText = explanation.toLowerCase();
        let score = 0;

        const authenticSignals = ["authentic", "real photo", "verified", "not fake", "not ai-generated", "not fabricated"];
        const aiSignals = ["ai-generated", "fake", "fabricated", "debunked", "not authentic", "not real"];

        authenticSignals.forEach(s => { if (fullText.includes(s)) score++; });
        aiSignals.forEach(s => { if (fullText.includes(s)) score--; });

        if (score > 0) {
            verdict = "Authentic Photograph";
        } else if (score < 0) {
            verdict = "AI-Generated";
        }
        
    } else {
        verdict = "No Online History Found";
    }

    return {
        probability: 0,
        verdict,
        explanation,
        highlights: [],
        groundingMetadata,
    };
};
