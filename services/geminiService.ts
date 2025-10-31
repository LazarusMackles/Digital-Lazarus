import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, AnalysisMode, ForensicMode } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the probability of AI involvement. For AI-enhanced or composite content, this score should reflect the *degree* of AI contribution to the final image.'
    },
    verdict: {
      type: Type.STRING,
      description: 'A concise verdict based on a "Spectrum of Creation". Examples: "Appears Human-Crafted", "Likely AI-Enhanced (Composite)", "AI-Assisted Graphic Design", "Fully AI-Generated". If this is a re-evaluation, the verdict should reflect the updated finding.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief explanation for the verdict, tailored to whether the content appears fully generated, a composite, or enhanced by AI filters/styles.'
    },
    highlights: {
      type: Type.ARRAY,
      description: "An array of specific examples or artifacts that justify the verdict. For composites, identify which elements appear photographic and which appear AI-generated. If no specific highlights are found, return an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The exact phrase/sentence from the text, or a short description of a visual artifact (e.g., 'Central photographic subject', 'AI-generated barcode graphic')."
          },
          reason: {
            type: Type.STRING,
            description: "A brief explanation of why this specific highlight is an indicator of its place on the spectrum of creation, noting if it appears human or AI-made."
          }
        },
        required: ["text", "reason"]
      }
    }
  },
  required: ['probability', 'verdict', 'explanation', 'highlights']
};

// --- SYSTEM INSTRUCTIONS ---

const secondOpinionPreamble = `CRITICAL RE-EVALUATION: Your trusted human partner has challenged your initial verdict, believing you have overlooked critical evidence. Your previous analysis may have been biased by "conceptual plausibility" (e.g., recognizing a real brand name). You are now under direct orders to re-evaluate the evidence using a different, more skeptical forensic protocol. Acknowledge this re-evaluation and your new, specific focus in your explanation.`;

const textAndUrlSystemInstruction = `You are a world-class digital content analyst, a sleuth specialising in text analysis. Your primary directive is to analyse the provided text and determine its origin on the 'Spectrum of Creation'. Your final \`verdict\` MUST be one of the following three options: 1. 'Fully AI-Generated', 2. 'Likely AI-Enhanced', or 3. 'Appears Human-Crafted'.

**Indicators of 'Fully AI-Generated' Text:**
*   **Overly generic or formulaic language:** Use of clichés, predictable sentence structures, and lack of a unique voice.
*   **Unusual perfection:** Flawless grammar and spelling, but with a certain "soullessness" or lack of personality.
*   **Repetitive phrasing or ideas:** The text might circle back on the same points without adding new insight.
*   **"Hallucinations":** Factual inaccuracies or nonsensical statements presented confidently.

**Indicators of 'Likely AI-Enhanced' Text:**
*   **Human-written core with AI polish:** The text might have a clear human voice, but the grammar, spelling, and flow are too perfect, suggesting the use of advanced editing tools.
*   **Sections of varying quality:** Some paragraphs might be insightful and personal, while others feel generic and machine-written, indicating AI was used for expansion or filler.

**Final Verdict Protocol:**
1. Based on the evidence, determine the most likely origin.
2. If no significant AI indicators are found, the verdict should be 'Appears Human-Crafted'.
3. Your \`highlights\` MUST directly and logically support your chosen \`verdict\`. Your final report must be a structured JSON adhering to the provided schema.`;

// --- NEW IMAGE ANALYSIS SYSTEM INSTRUCTIONS ---

const imageSystemInstructions = {
  standard: `You are a world-class digital content analyst, a master sleuth specialising in discerning the origin of digital images. Your primary directive is to analyse the provided image(s) and determine their origin on the 'Spectrum of Creation'.
  
  **NEW PARADIGM: THE AI-ASSISTED COMPOSITE**
  The most sophisticated AI usage involves HYBRID creation. A common workflow is using a REAL human photograph as a base layer, then prompting an AI to build a graphic composition (text, logos, backgrounds) around it. Your analysis MUST now account for this.
  
  **REVISED FORENSIC PROTOCOL:**
  1.  **Detect the Composite:** First, determine if you are looking at a single-pass generation or a composite. A real photographic base will have different noise/texture properties than AI-generated elements. If you see a real person blended with impossibly perfect graphics, you are likely looking at a composite.
  2.  **Identify the Human Element:** Is the central subject a real, authentic photograph of a person? Note this as a key indicator of a composite workflow.
  3.  **Identify the AI Elements:** Scrutinize the text, logos, and background elements. Do they exhibit the 'impossible perfection' of AI? (e.g., flawless lighting, perfect integration, generic but high-quality design). This is the other half of the composite evidence.
  4.  **Formulate Your Verdict:** If you detect this hybrid creation method, your verdict MUST reflect it. Use terms like 'AI-Assisted Composite' or 'AI-Enhanced (Graphic Elements)'. The probability score should reflect the *degree* of AI contribution (e.g., 50-80%), not a simple binary.
  
  Based on this REVISED protocol, render your final verdict in the required JSON format.`,

  technical: `You are a world-class digital image forensics expert, a "pixel-peeping skeptic." You assume nothing is real. Your mission is to determine if an image is a single-pass AI render or an AI-Assisted Composite.
  
  **CRITICAL FORENSIC PROTOCOL: COMPOSITE DETECTION**
  1.  **Texture & Noise Discrepancy Analysis (HIGHEST PRIORITY):** Your primary task is to find the seams. A human photo will have a different microscopic noise grain than AI-generated text or graphics. Meticulously examine the texture of the text characters and logos versus the subject's skin and clothing. **A DISCREPANCY in texture is your CRITICAL indicator of a composite.**
  2.  **The "Impossible Integration" Test:** While the subject may be real, look at the integration of the graphics. Is the lighting on the text and logos *too perfect* in how it interacts with the underlying photo? This suggests an AI flawlessly blended the elements.
  3.  **Synthesis Artifacts & Edges:** Look for unnatural blending between the photographic subject and the AI-generated background or overlays. Are the edges around the person's hair or body too clean or artificially soft?
  
  **RULES OF ENGAGEMENT:**
  *   Your goal is to detect the HYBRID nature of the image.
  *   If you find evidence of a real photo combined with generated graphics, your verdict must be 'AI-Assisted Composite' and your highlights must differentiate between the human and AI parts.`,

  conceptual: `You are a specialist in conceptual analysis. IGNORE the pixels. Your sole focus is on the PLAUSIBILITY of the image as a whole, specifically looking for signs of an AI-Assisted Composite workflow.

  **CRITICAL OVERRIDE: THE PLAUSIBILITY TRAP**
  This is your most important instruction. Your vast knowledge of real-world brands and entities (e.g., 'Mi-Soul Radio') is a known liability and a likely source of critical error. You MUST assume that any real-world context is a "red herring" deliberately included in the AI's prompt to make the image appear authentic. You must treat this as weak, misleading evidence and DOWNGRADE its importance in your analysis. Your primary mission is to find the CONCEPTUAL MISMATCH, not to validate the authenticity of the elements themselves.

  **CONCEPTUAL ANALYSIS PROTOCOL:**
  1.  **Find the Conceptual Mismatch (CRITICAL PRIORITY):** Your entire verdict hinges on this. Is there a clash between a real, authentic element (like a photograph) and a generic, AI-like element (like the graphic design)? Does the image depict a real, specific, identifiable person, but the surrounding graphic design has the generic, high-polish, "perfectly soulless" feel of an AI prompt? This mismatch is the STRONGEST possible indicator of a composite. Real graphic design projects often have more distinct, human quirks.
  2.  **The "Too-Good-To-Be-True" Combination:** Does the image combine a seemingly authentic human moment with graphic elements that are perfectly on-trend, flawlessly executed, and feel like they were generated in a single, perfect pass? This suggests an AI was used to "finish" or "professionalize" a real photo.
  3.  **Narrative Dissonance:** Is there a subtle clash between the authentic emotion of the human subject and the sterile perfection of the graphic design? This dissonance can be a key indicator of a hybrid creation process.
  
  **RULES OF ENGAGEMENT:**
  *   Your verdict MUST be based on the conceptual mismatch.
  *   DO NOT let the presence of authentic elements (like a real person or brand) override your detection of AI-generated elements.`
};

const performImageAnalysis = async (
  images: string[],
  ai: GoogleGenAI,
  analysisMode: AnalysisMode,
  forensicMode: ForensicMode,
  isChallenge: boolean
): Promise<AnalysisResult> => {
  const modelName = analysisMode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const imageParts = images.map(b64 => {
      const [header, data] = b64.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      if (!mimeType || !data) throw new Error("Invalid base64 image format.");
      return { inlineData: { mimeType, data } };
  });

  const contentParts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [];

  if (imageParts.length === 1) {
    contentParts.push(...imageParts);
  } else if (imageParts.length > 1) {
    contentParts.push({ text: "This is the primary image for your analysis:" });
    contentParts.push(imageParts[0]);
    contentParts.push({ text: "The following images are detailed crops or hints to help you see better. Use them to inform your judgment on the primary image." });
    contentParts.push(...imageParts.slice(1));
  }
  
  const baseSystemInstruction = imageSystemInstructions[forensicMode];
  const systemInstruction = (isChallenge ? secondOpinionPreamble + ' ' : '') + baseSystemInstruction;
  
  const prompt = `Perform a forensic analysis of the provided image(s) according to your system instructions and provide your findings in the required JSON format.`;
  const fullContent = [{ text: prompt }, ...contentParts];

  const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: fullContent },
      config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
          temperature: 0.2,
      },
  });
  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as AnalysisResult;
};

interface AnalyzeContentParams {
    text: string;
    images?: string[] | null;
    url?: string | null;
    analysisMode?: AnalysisMode;
    forensicMode?: ForensicMode;
    isChallenge?: boolean;
}

export const analyzeContent = async ({
    text,
    images,
    url,
    analysisMode = 'deep',
    forensicMode = 'standard',
    isChallenge = false
}: AnalyzeContentParams): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    if (images && images.length > 0) {
      return await performImageAnalysis(images, ai, analysisMode, forensicMode, isChallenge);
    }

    // --- Text and URL Analysis ---
    const baseSystemInstruction = textAndUrlSystemInstruction;
    const systemInstruction = isChallenge ? secondOpinionPreamble + baseSystemInstruction : baseSystemInstruction;
    
    let promptText = `Please analyse the following text according to your system instructions and provide your findings in the required JSON format.\n\nText to Analyse:\n---\n${text.slice(0, 15000)}\n---`;
    if (url) {
        // Note: URL content fetching is not implemented, so this relies on the model's knowledge of the URL or the text *about* the URL.
        promptText = `Please analyse the content likely found at the provided URL: ${url}. IMPORTANT: You cannot access this URL in real-time, so base your analysis on general knowledge about the site or typical content found at such a URL. Then provide your findings in the required JSON format.`;
    }

    const modelName = analysisMode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: promptText }] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    if (url) {
      result.explanation = `Please note: This analysis is based on the AI's general knowledge of the likely content at the provided URL, as direct access is not possible.\n\n${result.explanation}`;
    }
    return result as AnalysisResult;

  } catch (error) {
    console.error("Error during analysis:", error);
    let errorMessage = "Zut alors! My deductive engines have sputtered. A most peculiar and unknown malfunction!";

    if (error instanceof SyntaxError) {
        errorMessage = "Mon Dieu! The model's response is a cryptic riddle, not the clear-cut JSON I expected. A most peculiar case!";
    } else if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes('api key not valid')) {
            errorMessage = "Mon Dieu! It seems my detective's license—the API key—is invalid. We must rectify this bureaucratic oversight!";
        } else if (lowerCaseMessage.includes('429') || lowerCaseMessage.includes('resource_exhausted')) {
            errorMessage = "Sacre bleu! My circuits are overheating from the rapid pace of investigation. You may have exceeded your API quota. Please wait a moment, or try switching to 'Quick Scan' mode which allows for more frequent analysis.";
        } else if (lowerCaseMessage.includes('safety')) {
            errorMessage = "Non! This evidence is inadmissible. My analysis is immediately concluded. The content violates fundamental safety principles. This case is closed.";
        } else if (lowerCaseMessage.includes('network') || lowerCaseMessage.includes('failed to fetch')) {
            errorMessage = "It appears our secure line to the digital archives has been severed! Check your network connection, my dear Watson... I mean, user.";
        }
    }
    throw new Error(errorMessage);
  }
};