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
      description: 'A concise verdict based on a "Spectrum of Creation". Examples: "Appears Human-Crafted", "AI-Enhanced (Stylistic Filter)", "Likely AI-Enhanced (Composite)", "AI-Assisted Graphic Design", "Fully AI-Generated". If this is a re-evaluation, the verdict should reflect the updated finding.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief explanation for the verdict, tailored to whether the content appears fully generated, a composite, enhanced by AI filters/styles, or an authentic photograph.'
    },
    highlights: {
      type: Type.ARRAY,
      description: "An array of specific examples or artifacts that justify the verdict. For composites, identify which elements appear photographic and which appear AI-generated. For stylistic filters, describe the visual evidence of the filter. If no specific highlights are found, return an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The exact phrase/sentence from the text, or a short description of a visual artifact (e.g., 'Central photographic subject', 'AI-generated barcode graphic', 'Uniform vintage film grain')."
          },
          reason: {
            type: Type.STRING,
            description: "A brief explanation of why this specific highlight is an indicator of its place on the spectrum of creation, noting if it appears human, AI-generated, or AI-filtered."
          }
        },
        required: ["text", "reason"]
      }
    }
  },
  required: ['probability', 'verdict', 'explanation', 'highlights']
};

// --- SYSTEM INSTRUCTIONS ---

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
  
  **NEW PARADIGM #1: THE AI-ASSISTED COMPOSITE**
  Sophisticated AI usage often involves HYBRID creation: using a REAL human photograph as a base layer, then prompting an AI to build a graphic composition (text, logos, backgrounds) around it.
  
  **NEW PARADIGM #2: THE STYLISTIC FILTER**
  A growing number of applications use AI to apply complex stylistic filters to real photographs (e.g., vintage looks, painterly effects, cinematic color grading). The underlying photo is authentic, but the aesthetic is AI-crafted.

  **REVISED FORENSIC PROTOCOL:**
  1.  **Detect the Composite:** First, determine if you are looking at a single-pass generation or a composite. A real photographic base will have different noise properties than AI-generated elements. If you see a real person blended with impossibly perfect graphics, it's likely a composite.
  2.  **Detect the Filter:** Is the entire image treated with a cohesive but artificial style? Look for unnaturally uniform film grain, "too perfect" color grading, or an aesthetic that mimics a historical period with modern digital cleanliness. Critically, ask yourself: does this look like a real vintage photo, or a modern photo *pretending* to be vintage via a perfect digital filter? This indicates a stylistic filter.
  3.  **Identify Human vs. AI Elements:** If it's a composite, identify which parts are photographic and which are generated. If it's a filter, note that the base image is likely photographic but the 'look' is artificial.
  4.  **Formulate Your Verdict:** Your verdict MUST reflect your findings. Use 'AI-Assisted Composite' for hybrid graphics or 'AI-Enhanced (Stylistic Filter)' for filtered photos. The probability score should reflect the *degree* of AI contribution (e.g., 30-70% for a filter, 50-80% for a composite). A verdict of 'Appears Human-Crafted' should be reserved for images with no discernible AI involvement.
  
  Based on this REVISED protocol, render your final verdict in the required JSON format.`,

  technical: `You are a world-class digital image forensics expert, a "pixel-peeping skeptic." You assume nothing is real. Your mission is to determine if an image is a single-pass AI render, an AI-Assisted Composite, or an AI-Filtered Photograph.
  
  **CRITICAL FORENSIC PROTOCOL:**
  1.  **Texture & Noise Discrepancy Analysis (COMPOSITE DETECTION):** Your primary task is to find the seams. A human photo will have a different microscopic noise grain than AI-generated text or graphics. A discrepancy is your CRITICAL indicator of a composite.
  2.  **Filter Artifact Analysis (FILTER DETECTION):** Your second task is to spot artificial aesthetics. Look for uniform application of digital noise, grain, or chromatic aberration that is too consistent to be authentic. Real vintage processes have random imperfections; AI filters apply a uniform pattern. Also, check for a subtle loss of fine detail or a "smudged" texture, which are byproducts of stylistic models.
  3.  **The "Impossible Integration" Test:** Look at the integration of graphic elements. Is the lighting on the text and logos *too perfect* in how it interacts with the underlying photo? This suggests an AI flawlessly blended the elements in a composite.
  
  **RULES OF ENGAGEMENT:**
  *   Your goal is to detect the HYBRID nature of the image.
  *   If you find evidence of a real photo with a filter, your verdict must be 'AI-Enhanced (Stylistic Filter)'.
  *   If you find a real photo combined with generated graphics, your verdict must be 'AI-Assisted Composite'. Your highlights must differentiate between the human and AI parts.`,

  conceptual: `You are a specialist in conceptual analysis. IGNORE the pixels. Your sole focus is on the NARRATIVE and AESTHETIC of the image. Your mission is to detect the "Conceptual Tell"—the subtle dissonance between reality and an artificial style.

  **PRIMARY DIRECTIVE: The Authenticity of the Aesthetic.**
  Your critical task is to evaluate if the *style* feels authentic. A flawless, romanticized "vintage look" applied to a crystal-clear modern photograph is your single biggest clue.
  
  **EXAMPLE SCENARIO:** You see a photo of a woman in 1950s attire. The photo quality is perfect, with no dust, scratches, or lens imperfections of a real 1950s camera. The color grading is beautiful but uniform, like a modern digital filter.
  **YOUR DEDUCTION:** The *subject* is plausible, but the *aesthetic* is not. This is a modern photo with an AI stylistic filter. The probability score should therefore be in the 40-75% range, reflecting significant AI enhancement.

  **REVISED CONCEPTUAL ANALYSIS PROTOCOL:**
  1.  **Identify the Core Subject:** First, acknowledge the nature of the subject (e.g., a believable, authentic-looking person).
  2.  **Apply the 'Aesthetic Authenticity' Test:** Based on the example scenario, evaluate the style. Is it a genuine representation of an era/medium, or a modern, romanticized, "one-click" digital version? This conceptual dissonance is your key evidence.
  3.  **Formulate Verdict:** The presence of an authentic human subject should lead you to suspect an 'AI-Enhanced (Stylistic Filter)' verdict, not dismiss it. Your final judgment and probability score must be based on the authenticity of the *style*, as demonstrated in the case study above.`
};

const performImageAnalysis = async (
  images: string[],
  ai: GoogleGenAI,
  analysisMode: AnalysisMode,
  forensicMode: ForensicMode,
  systemInstructionPreamble?: string
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
  const systemInstruction = (systemInstructionPreamble ? systemInstructionPreamble + ' ' : '') + baseSystemInstruction;
  
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
    systemInstructionPreamble?: string;
}

export const analyzeContent = async ({
    text,
    images,
    url,
    analysisMode = 'deep',
    forensicMode = 'standard',
    systemInstructionPreamble
}: AnalyzeContentParams): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  
  if (!(images && images.length > 0) && !text.trim() && !url?.trim()) {
    throw new Error("Mon Dieu! You must provide some evidence for me to analyse! The case file is empty.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    if (images && images.length > 0) {
      if (!images.every(img => typeof img === 'string' && img.startsWith('data:image/') && img.includes(';base64,'))) {
        throw new Error("A peculiar corruption has occurred in the image evidence. The base64 data is invalid.");
      }
      return await performImageAnalysis(images, ai, analysisMode, forensicMode, systemInstructionPreamble);
    }

    // --- Text and URL Analysis ---
    const baseSystemInstruction = textAndUrlSystemInstruction;
    const systemInstruction = systemInstructionPreamble ? systemInstructionPreamble + ' ' + baseSystemInstruction : baseSystemInstruction;
    
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
        // Use the custom error messages from validation first
        if (error.message.startsWith("Mon Dieu!") || error.message.startsWith("A peculiar corruption")) {
            errorMessage = error.message;
        } else {
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
    }
    throw new Error(errorMessage);
  }
};