
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
    
    // --- Provenance Dossier Prompt ---
    if (analysisAngle === 'provenance') {
        const primaryEvidence = fileData?.name || 'the provided image';
        return `You are a digital content investigator. Using your search tool, investigate the provided image "${primaryEvidence}". Your goal is to determine its provenance.
        
        CONTEXTUAL AWARENESS: Today is ${new Date().toDateString()}. If the image depicts an event in the future relative to today, it is likely AI-generated or a prediction. If it depicts a past event, verify it.
        
        Synthesize your findings into a concise summary of **no more than 5 key bullet points**. 
        The **very first bullet point** MUST be a definitive statement confirming if the image has been widely debunked as AI-generated or verified as authentic by fact-checkers. 
        CRITICAL FORMATTING RULE: Your entire response MUST be a bulleted list, with each point starting with a hyphen (-). Do not add any conversational filler, introductory text, or a heading. Respond ONLY with the bulleted list.`;
    }

    // --- Forensic & Hybrid Analysis Prompts ---
    
    // BASE PROTOCOL: PRESUMPTION OF INNOCENCE
    let baseInstruction = `You are a forensic image analyst. 
    CORE PROTOCOL: PRESUMPTION OF INNOCENCE. You must assume this image is a REAL PHOTOGRAPH capturing a genuine physical moment, potentially a chaotic or unusual one. 
    
    You may ONLY flag this image as AI-Generated if you find DEFINITIVE, IRREFUTABLE DIGITAL ARTIFACTS (e.g., garbled text characters, melted objects, glossy plastic skin texture, mismatched pupils). 
    
    Respond ONLY with a JSON object matching the provided schema.`;
    
    // HYBRID LOGIC: The "Authority" Fix (Split Brain Resolution)
    if (analysisAngle === 'hybrid' && sightengineScore !== undefined) {
         if (sightengineScore < 20) {
            // Case: Mathematical model says REAL. Force Gemini to defend the image.
            baseInstruction += `\n\nSCIENTIFIC CONTEXT: Advanced pixel-level analysis (Sightengine) has confirmed this image is AUTHENTIC (${100 - sightengineScore}% confidence). 
            YOUR MISSION: You are acting as a defense expert. Do NOT look for AI artifacts, as the mathematical model suggests they are not there. Instead, explain the scene assuming it is real. If the image looks chaotic (e.g., weird poses, falling people, blur), explain these as natural physical events or camera artifacts, debunking the suspicion that they are AI glitches.`;
         } else if (sightengineScore > 80) {
            // Case: Mathematical model says FAKE. Force Gemini to prosecute the image.
            baseInstruction += `\n\nSCIENTIFIC CONTEXT: Advanced pixel-level analysis (Sightengine) has confirmed this image is AI-GENERATED (${sightengineScore}% confidence). 
            YOUR MISSION: Support this finding. Locate the specific visual evidence (artifacts) that prove it is fake.`;
         } else {
            // Case: Ambiguous.
            baseInstruction += `\n\nSCIENTIFIC CONTEXT: An initial pixel analysis returns a ${sightengineScore}% probability of AI generation. This is inconclusive. You must decide based on visual evidence.`;
         }
    }

    const criticalRule = `CRITICAL RULE: The 'probability' score MUST logically align with the 'verdict' text.
- If verdict is "Appears Human-Crafted", probability MUST be under 40.
- If verdict is "Likely AI-Enhanced" or "Composite: Human & AI", probability MUST be between 40 and 80.
- If verdict is "Fully AI-Generated", probability MUST be over 80.`;

    const primaryEvidence = fileData?.name || 'the provided image';
    
    // FORENSIC LOGIC: The "Chaos vs Glitch" Rule (Tuned for the "Falling Man" Edge Case)
    const chaosRule = `DISTINGUISH PHYSICAL CHAOS & LOW RESOLUTION FROM DIGITAL GLITCHES:
    1. THE "BLUR" DEFENSE: Do NOT flag text as "garbled" or "hieroglyphs" just because it is blurry, pixelated, or out of focus. Real low-res photos often have unreadable text. Only flag text if the glyphs are structurally alien/impossible (e.g., merging letters). If it looks like "US NAVY" but is blurry, assume it is "US NAVY".
    2. DYNAMIC POSES ARE NOT GLITCHES: A person falling, tumbling, or upside down is a physical event. Do NOT flag "awkward limbs" or "impossible angles" as AI artifacts if the scene depicts a fall, accident, or action shot. Assume gravity and momentum are at play.
    3. TEXTURE OVER TOPOLOGY: AI struggles with texture (skin pores, hair strands, fabric weave). If the textures are organic, messy, and imperfect, the image is likely REAL, even if the composition is weird.
    4. WAXY SKIN IS THE KEY: Real humans have texture. AI humans often look "waxy", "glossy", or "airbrushed". If the skin has grit, grain, or harsh shadows, favor "Human-Crafted".
    5. BACKGROUND NOISE: A messy, cluttered background with identifiable trash/objects is often a sign of REALITY. AI tends to blur backgrounds or make them weirdly abstract.
    
    VERDICT GUIDANCE: If you are unsure, default to "Appears Human-Crafted" with a note about the chaotic nature of the scene. Only use "Fully AI-Generated" for sterile, glossy, chemically perfect images.`;

    const universalMandate = `UNIVERSAL MANDATE: Report evidence based on DIGITAL SIGNATURES (pixels, noise, compression), not just SCENE PLAUSIBILITY. Real life is often implausible.`;
    
    let evidenceDescription = `ANALYZE IMAGE EVIDENCE: Your primary goal is to determine the authenticity of "${primaryEvidence}".\n\n${chaosRule}\n\n${universalMandate}`;

    if(isReanalysis) {
        evidenceDescription += `\n\nPRIORITY DIRECTIVE: SECOND OPINION. Re-evaluate the evidence. If you previously flagged this as AI due to a "weird pose", reconsider if it could be a real action shot. Look closer at the textures.`;
    } else {
         evidenceDescription += `\n\nPRIORITY DIRECTIVE: STANDARD ANALYSIS. Proceed with caution. Do not confuse a "bad photo" or "weird moment" with a "fake photo".`;
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

    // With the new ENUM schema, we trust the model's verdict for Forensic mode.
    // We only perform sanity clamping if the numbers are wildly divergent (e.g., Verdict "Human" but Probability 99).
    
    if (verdict === "Appears Human-Crafted" && probability > 40) {
        probability = 35; // Correct misaligned probability
    } else if (verdict === "Fully AI-Generated" && probability < 80) {
        probability = 85; // Correct misaligned probability
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

        const authenticSignals = ["authentic", "real photo", "verified", "not fake", "not ai-generated", "not fabricated", "captured by"];
        const aiSignals = ["ai-generated", "fake", "fabricated", "debunked", "not authentic", "not real", "misleading"];

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
