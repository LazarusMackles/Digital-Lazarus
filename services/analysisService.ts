
import type { AnalysisAngle, AnalysisResult } from '../types';

// --- Forensic Defenses & Chaos Rules ---
const FORENSIC_DEFENSES = [
    "THE 'BLUR' DEFENSE: Do NOT flag text as 'garbled' or 'hieroglyphs' just because it is blurry, pixelated, or out of focus. Real low-res photos often have unreadable text. Only flag text if the glyphs are structurally alien/impossible.",
    "DYNAMIC POSES ARE NOT GLITCHES: A person falling, tumbling, or upside down is a physical event. Do NOT flag 'awkward limbs' as AI artefacts if the scene depicts action. Assume gravity and momentum are at play.",
    "THE 'MUSEUM' DEFENSE: If the scene is a museum or gallery, do NOT flag sculptures or paintings as 'anatomically impossible.' Art is intentionally stylised. Only flag digital artefacts on the people or the physical environment.",
    "SOCIAL MEDIA COMPRESSION: Images from Facebook/WhatsApp are heavily compressed. This creates 'blocky' noise. Do NOT mistake this for AI 'waxy' textures.",
    "THE 'OCCLUSION' DEFENSE: In crowded scenes, heads or limbs may appear 'disembodied' because one person is blocking another. This is a sign of a real photo. If you see a head without a body in a crowd, assume the body is hidden.",
    "TEXTURE OVER TOPOLOGY: AI struggles with organic texture (skin pores, hair strands). If textures are messy and imperfect, the image is likely REAL.",
    "WAXY SKIN IS THE KEY: AI humans often look 'waxy' or 'airbrushed'. If the skin has grit, grain, or harsh shadows, favor 'Human-Crafted'.",
    "BACKGROUND NOISE: A messy, cluttered background with identifiable trash/objects is a sign of REALITY. AI tends to blur backgrounds or make them abstract.",
    "THE 'STROBE' DEFENSE: Professional photographers often use off-camera flashes or strobes. This creates lighting that does NOT match the ambient environment (e.g., a brightly lit subject against a dark background). Do NOT flag this as 'impossible lighting' if the subject has sharp, consistent shadows indicating a physical light source.",
    "LARGE FORMAT CHARACTERISTICS: High-end film photography (4x5, 8x10) can produce extreme detail combined with shallow depth-of-field 'blur' that may look like AI waxy textures. If you see film branding (Kodak, Fujifilm) or authentic grain, be extremely cautious."
];

const CHAOS_RULE = `DISTINGUISH PHYSICAL CHAOS & LOW RESOLUTION FROM DIGITAL GLITCHES:
${FORENSIC_DEFENSES.map((d, i) => `${i + 1}. ${d}`).join('\n')}

STRICT EVIDENCE BAR: "Anatomical anomalies" in a crowd or complex scene are NEVER enough evidence on their own to flag an image as AI. You MUST find supporting digital artefacts (waxy skin, garbled pixels, impossible lighting) to reach a "Fully AI-Generated" verdict.

VERDICT GUIDANCE: If you are unsure, default to "Appears Human-Crafted" with a note about the chaotic nature of the scene. Only use "Fully AI-Generated" for sterile, glossy, chemically perfect images.`;

/**
 * Generates a direct, command-based prompt for the Gemini model.
 */
export const buildPrompt = (
    fileData: { name: string } | null, 
    analysisAngle: AnalysisAngle,
    isReanalysis: boolean,
    pixelScore?: number,
    provenanceData?: string,
): string => {
    
    // BASE PROTOCOL: PRESUMPTION OF INNOCENCE
    let baseInstruction = `You are a forensic image analyst. 
    CORE PROTOCOL: PRESUMPTION OF INNOCENCE. You must assume this image is a REAL PHOTOGRAPH capturing a genuine physical moment, potentially a chaotic or unusual one. 
    
    You may ONLY flag this image as AI-Generated if you find DEFINITIVE, IRREFUTABLE DIGITAL ARTEFACTS (e.g., garbled text characters, melted objects, glossy plastic skin texture, mismatched pupils). 
    
    Respond ONLY with a JSON object matching the provided schema.`;

    // PROVENANCE DATA: The "Truth Anchor"
    if (provenanceData) {
        baseInstruction += `\n\nPROVENANCE DATA (TRUTH ANCHOR): A background search for this image has returned the following findings:
        "${provenanceData}"
        
        Use this data to verify if the image is a known photograph by a specific artist or has a documented history. If this data confirms the image is real, your visual analysis should focus on explaining the artistic or technical choices that make it look unique.`;
    }
    
    // HYBRID LOGIC: The "Vanguard Absolute Authority" Fix
    if (analysisAngle === 'hybrid' && pixelScore !== undefined) {
         if (pixelScore < 15) {
            // Case: Mathematical model says REAL. Force Gemini to defend the image.
            baseInstruction += `\n\nSCIENTIFIC CONTEXT: Advanced pixel-level analysis has confirmed this image is AUTHENTIC (${100 - pixelScore}% confidence). 
            VANGUARD ABSOLUTE AUTHORITY: The mathematical sensor has ruled this image as REAL. Your mission is to explain WHY it is real. Look for artistic choices (off-camera flash, large-format film, intentional blur) that might trick a standard AI detector. You are FORBIDDEN from flagging this as AI unless you find a literal digital glitch (e.g., a sixth finger or garbled text). Impossible lighting is NOT enough, as it may be a professional strobe.`;
         } else if (pixelScore > 85) {
            // Case: Mathematical model says FAKE. Force Gemini to prosecute the image.
            baseInstruction += `\n\nSCIENTIFIC CONTEXT: Advanced pixel-level analysis has confirmed this image is AI-GENERATED (${pixelScore}% confidence). 
            YOUR MISSION: Support this finding. Locate the specific visual evidence (artefacts) that prove it is fake.`;
         } else {
            // Case: Ambiguous.
            baseInstruction += `\n\nSCIENTIFIC CONTEXT: An initial pixel analysis returns a ${pixelScore}% probability of AI generation. This is inconclusive. You must decide based on visual evidence.`;
         }
    }

    const criticalRule = `CRITICAL RULE: The 'probability' score MUST logically align with the 'verdict' text.
- If verdict is "Appears Human-Crafted", probability MUST be under 40.
- If verdict is "Likely AI-Enhanced" or "Composite: Human & AI", probability MUST be between 40 and 80.
- If verdict is "Fully AI-Generated", probability MUST be over 80.`;

    const primaryEvidence = fileData?.name || 'the provided image';
    
    const universalMandate = `UNIVERSAL MANDATE: Report evidence based on DIGITAL SIGNATURES (pixels, noise, compression), not just SCENE PLAUSIBILITY. Real life is often implausible.`;
    
    let evidenceDescription = `ANALYSE IMAGE EVIDENCE: Your primary goal is to determine the authenticity of "${primaryEvidence}".\n\n${CHAOS_RULE}\n\n${universalMandate}`;

    if(isReanalysis) {
        evidenceDescription += `\n\nPRIORITY DIRECTIVE: ADVERSARIAL SECOND OPINION. You are a senior peer reviewer tasked with challenging the initial findings. 
        
        CHAIN OF THOUGHT REQUIREMENT:
        1. List 3 specific reasons why the previous verdict might be incorrect.
        2. Re-examine the image for subtle artefacts (or lack thereof) that support a different conclusion.
        3. Only then, provide your final verdict.
        
        Be extremely critical of first impressions. If the image was previously flagged as AI, look for reasons why it might be a genuine, chaotic photograph. If it was flagged as real, look for subtle digital signatures you might have missed.`;
    } else {
         evidenceDescription += `\n\nPRIORITY DIRECTIVE: STANDARD ANALYSIS. Proceed with caution. Do not confuse a "bad photo" or "weird moment" with a "fake photo".`;
    }
    
    const modeInstruction = `OUTPUT FORMAT: Conduct a "Deep Dive". Your response MUST be a valid JSON object matching this structure:
    {
      "verdict": "Appears Human-Crafted" | "Likely AI-Enhanced" | "Composite: Human & AI" | "Fully AI-Generated",
      "probability": number (0-100),
      "explanation": "string",
      "highlights": [{"text": "string", "reason": "string"}]
    }
    Respond ONLY with the JSON object. No markdown formatting, no preamble.`;
    
    return `${baseInstruction}\n\n${criticalRule}\n\n${evidenceDescription}\n\n${modeInstruction}`;
};


export const finaliseForensicVerdict = (rawResult: any, pixelScore?: number, groundingMetadata?: any): AnalysisResult => {
    let probability = pixelScore !== undefined ? pixelScore : Math.round(rawResult.probability || 50);
    let verdict = rawResult.verdict || "Analysis Inconclusive";
    const explanation = rawResult.explanation || "The model did not provide a detailed explanation.";
    const highlights = rawResult.highlights || [];

    // If using a mathematical score, align the verdict to it.
    if (pixelScore !== undefined) {
        if (pixelScore > 80) verdict = "Fully AI-Generated";
        else if (pixelScore > 40) verdict = "Likely AI-Enhanced";
        else verdict = "Appears Human-Crafted";
    }

    // Sanity clamping
    if (verdict === "Appears Human-Crafted" && probability > 40) {
        probability = 35; 
    } else if (verdict === "Fully AI-Generated" && probability < 80) {
        probability = 85; 
    }

    return {
        probability,
        verdict,
        explanation,
        highlights,
        groundingMetadata,
    };
};
