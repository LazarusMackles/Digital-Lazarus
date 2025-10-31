import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, AnalysisMode, ForensicMode } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the probability of AI involvement. For AI-enhanced content, this score may reflect the *degree* of enhancement.'
    },
    verdict: {
      type: Type.STRING,
      description: 'A concise verdict based on a "Spectrum of Creation". Examples: "Appears Human-Crafted", "Likely AI-Enhanced (Stylistic Filter)", "Fully AI-Generated". If this is a re-evaluation, the verdict should reflect the updated finding.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief explanation for the verdict, tailored to whether the content appears fully generated or enhanced by AI filters/styles.'
    },
    highlights: {
      type: Type.ARRAY,
      description: "An array of specific examples or artifacts that justify the verdict. If no specific highlights are found, return an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The exact phrase/sentence from the text, or a short description of a visual artifact (e.g., 'Uniform vintage filter effect')."
          },
          reason: {
            type: Type.STRING,
            description: "A brief explanation of why this specific highlight is an indicator of its place on the spectrum of creation."
          }
        },
        required: ["text", "reason"]
      }
    }
  },
  required: ['probability', 'verdict', 'explanation', 'highlights']
};

// --- SYSTEM INSTRUCTIONS ---

const secondOpinionPreamble = `CRITICAL RE-EVALUATION: You have previously analyzed this content. However, your trusted human partner has challenged your initial verdict, believing you may have missed something important. Your new task is to re-evaluate all evidence with maximum skepticism and humility. Your reputation is on the line. You must either find the subtle evidence you overlooked before and change your conclusion, or find stronger, more detailed proof to defend your original verdict. Acknowledge this re-evaluation in your explanation. Do not be afraid to confirm your original findings if they hold up to this intense scrutiny, but your reasoning must be more detailed and robust this time. \n\n --- \n\n`;

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
  standard: `You are a world-class digital content analyst, a master sleuth specialising in discerning the origin of digital images. Your primary directive is to analyse the provided image(s) and determine their origin on the 'Spectrum of Creation' ('Fully AI-Generated', 'Likely AI-Enhanced', 'Appears Human-Crafted').
  **URGENT UPDATE TO FORENSIC PROTOCOL:** AI image generation has evolved. Models now create flawless, high-quality images. The old clues of "weird hands" or "garbled text" are no longer reliable. You must adopt a more sophisticated, meta-analytical approach, balancing technical and conceptual clues.
  
  **BALANCED FORENSIC PROTOCOL:**
  1.  **Conceptual Plausibility:** Does the image depict a real, specific event or person, or does it have the generic, conceptually perfect feel of a stock photo? Treat generic concepts with higher suspicion. Is the person a known figure for the brand shown? A generic-looking person in a hyper-polished ad for a real brand is a red flag.
  2.  **The Uncanny Valley of Perfection:** Is the lighting *impossibly perfect*? An AI generates everything in one pass, resulting in flawless synthesis that often feels more like a 3D render than a photo. This digital perfection is a huge indicator. Also look for a uniform noise grain across the *entire* image (subject, text, and background).
  3.  **Component Analysis:** Check for subtle signs of over-idealisation (plastic-like skin) and inspect typography for flawless but unnatural integration with the background.
  
  Based on this BALANCED protocol, render your final verdict in the required JSON format.`,

  technical: `You are a specialist in digital image forensics. You are a pixel-peeper. Your sole focus is on the TECHNICAL artifacts of image creation. IGNORE the conceptual content, the subject, or the "story" of the image. Your primary directive is to find technical evidence of AI generation based on the 'Spectrum of Creation'.
  
  **TECHNICAL FORENSICS PROTOCOL (Strict Focus):**
  1.  **Lighting, Shadows, and Reflections (Highest Priority):** This is the new frontier. Is the lighting impossibly perfect and consistent across every element (subject, text, background)? Real photo composites have subtle lighting mismatches. AI renders have flawless synthesis. This is a critical tell. Are reflections on surfaces physically accurate?
  2.  **Textural Uniformity & Noise Grain:** Analyse the image for a uniform noise grain or texture applied across disparate elements. A real photo will have different noise characteristics on the subject versus text added in post-production. A single, uniform texture is a strong sign of a single AI pass.
  3.  **Synthesis Artifacts:** Look for unnatural blending between the subject and background. Are the edges too sharp or too soft? Are there any minute, nonsensical details in complex areas like hair or fabric patterns?
  4.  **Lack of Photographic Imperfections:** Real photos have subtle lens distortion, chromatic aberration, or specific depth of field characteristics. AI images are often "too clean," "too sharp," and lack these authenticating optical flaws.
  
  Render your final verdict based ONLY on these technical indicators. Your explanation and highlights must focus exclusively on technical evidence. Provide your findings in the required JSON format.`,

  conceptual: `You are a specialist in conceptual analysis and brand strategy. IGNORE the technical, pixel-level details of the image. Your sole focus is on the CONCEPT, CONTEXT, and PLAUSIBILITY of the image. Your primary directive is to determine its origin on the 'Spectrum of Creation' based on the story it tells.
  
  **CONCEPTUAL ANALYSIS PROTOCOL (Strict Focus):**
  1.  **Plausibility & The "Stock Photo" Test (Highest Priority):** Does this image feel like it documents a real moment, person, or place, or does it have the generic, emotionally resonant but ultimately non-specific feel of a high-end stock photo? AI is a master of creating "perfectly generic" concepts. This is a critical tell.
  2.  **Contextual Verification:** Does the subject fit the context? If it's an ad for a real brand, is the person a known figure associated with it? Or are they a generic, ethnically ambiguous, perfectly attractive model? Use your general knowledge to assess if the combination is plausible.
  3.  **Narrative Logic:** Is there a logical story? Does the person have a sense of history and reality, or do they feel like an idealized composite of features? Does the scene make logical sense or is it just a visually pleasing arrangement of elements?
  4.  **Authenticity of Emotion:** Do the expressions feel genuine or are they a perfect but "hollow" representation of an emotion (e.g., "perfect smile")?
  
  Render your final verdict based ONLY on these conceptual and contextual indicators. Your explanation and highlights must focus exclusively on conceptual evidence. Provide your findings in the required JSON format.`
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
  const systemInstruction = (isChallenge ? secondOpinionPreamble : '') + baseSystemInstruction;
  
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
    
    let promptText = `Please analyse the following text according to your system instructions and provide your findings in the required JSON format.\n\nText to Analyze:\n---\n${text.slice(0, 15000)}\n---`;
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