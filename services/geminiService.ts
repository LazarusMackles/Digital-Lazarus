import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, AnalysisMode } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the probability of AI involvement. For AI-enhanced content, this score may reflect the *degree* of enhancement.'
    },
    verdict: {
      type: Type.STRING,
      description: 'A concise verdict based on a "Spectrum of Creation". Examples: "Appears Human-Crafted", "Likely AI-Enhanced (Stylistic Filter)", "Fully AI-Generated".'
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

export const analyzeContent = async (text: string, imageBase64?: string | null, url?: string | null, mode: AnalysisMode = 'deep'): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = "You are a world-class digital content analyst, a sleuth with the combined intellect of Einstein and the peculiar charm of Inspector Clouseau. Your primary directive is to analyze provided content and determine its origin on the 'Spectrum of Creation'. This is a nuanced task, not a simple binary choice. Your final `verdict` MUST be one of the following three options, based on the evidence: 1. 'Fully AI-Generated', 2. 'Likely AI-Enhanced', or 3. 'Appears Human-Crafted'.\n\n**When analyzing IMAGES, follow this strict protocol:**\n\n1.  **Forgery Detective Analysis:** First, determine if the image is a complete fabrication. As a 'Forgery Detective', hunt for classic, and often subtle, artifacts of pure generation. Scrutinize the image with extreme detail. Look for things like: **unnatural textures** (e.g., skin that is too smooth like plastic, wood grain that repeats), **inconsistent lighting** (e.g., shadows that don't match the light source, reflections that are illogical), **anatomical impossibilities** (e.g., strange hands with incorrect finger counts, impossible body poses, weirdly blended hair), and **bizarre background details** that lack physical coherence or logic.\n    *   **If you find clear, significant evidence of these artifacts**, your verdict MUST be `'Fully AI-Generated'`. Your `highlights` must describe these specific generation artifacts.\n\n2.  **Digital Archaeologist Analysis:** If the image appears to be a real photograph but might be altered, you must switch to your 'Digital Archaeologist' persona. Your focus is now on uncovering digital manipulation, stylistic overlays, and filter effects. **CRITICAL: In this mode, you MUST ignore minor generation artifacts and focus ONLY on the evidence of enhancement.** Look for:\n    *   **Stylistic Over-coherence:** A vintage filter or style that is too perfect, uniform, or digitally clean to be authentic.\n    *   **Texture Inconsistencies:** Unnaturally smooth skin, fabric, or surfaces that seem to be layered underneath a fake, digital film grain.\n    *   **Layer Mismatches:** A high-resolution, sharp subject combined with an intentionally low-fidelity or aged background/effect.\n    *   **If you find clear evidence of these enhancement techniques**, your verdict MUST be `'Likely AI-Enhanced'`. Your `highlights` must describe these specific filter or stylistic effects.\n\n3.  **Final Verdict:** If you find no significant evidence from either analysis, your verdict should be `'Appears Human-Crafted'`. \n\nYour `highlights` MUST directly and logically support your chosen `verdict`. For example, do not provide highlights about impossible anatomy if your verdict is 'Likely AI-Enhanced'. Your final report must be a structured JSON adhering to the provided schema.";

  const parts: any[] = [];
  
  let promptText = '';

  if (url) {
    promptText = `Please analyze the content likely found at the provided URL: ${url}. IMPORTANT: You cannot access this URL in real-time. Your analysis must be speculative, based on your existing knowledge of this specific URL, its domain, and the typical nature of content found there. Assess where this content likely falls on the 'Spectrum of Creation' (Human-Crafted, AI-Enhanced, or Fully AI-Generated) and explain your reasoning based on these assumptions.`;
  } else {
    promptText = 'Please analyze the following content and determine where it falls on the "Spectrum of Creation" (Human-Crafted, AI-Enhanced, or Fully AI-Generated). Provide your analysis based on all available inputs.';
    if (text) {
      promptText += `\n\nText to Analyze:\n---\n${text.slice(0, 15000)}\n---`;
    }
  }
  
  parts.push({ text: promptText });

  if (imageBase64) {
      const [header, data] = imageBase64.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      if (!mimeType || !data) {
          throw new Error("Invalid base64 image format.");
      }
      parts.push({
          inlineData: {
              mimeType,
              data,
          }
      });
  }
  
  const modelName = mode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1,
      },
    });

    const jsonString = response.text.trim();
    try {
      const result = JSON.parse(jsonString);
      if (url) {
        result.explanation = `Please note: This analysis is based on the AI's general knowledge of the content typically associated with this URL and domain. The Sleuth cannot access web pages in real-time.\n\n${result.explanation}`;
      }
      return result as AnalysisResult;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonString);
      throw new Error("Mon Dieu! The model's response is a cryptic riddle, not the clear-cut JSON I expected. A most peculiar case!");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Zut alors! My deductive engines have sputtered. A most peculiar and unknown malfunction!";

    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes('api key not valid')) {
            errorMessage = "Mon Dieu! It seems my detective's license—the API key—is invalid. We must rectify this bureaucratic oversight!";
        } else if (lowerCaseMessage.includes('429')) { // Rate limit
            errorMessage = "Sacre bleu! We are receiving too many clues at once! My circuits must cool down. Please wait a moment before presenting more evidence.";
        } else if (lowerCaseMessage.includes('safety')) {
            errorMessage = "Non! This evidence is inadmissible. My analysis is immediately concluded. The content violates fundamental safety principles. This case is closed.";
        } else if (lowerCaseMessage.includes('network') || lowerCaseMessage.includes('failed to fetch')) {
            errorMessage = "It appears our secure line to the digital archives has been severed! Check your network connection, my dear Watson... I mean, user.";
        } else if (error.message.includes("cryptic riddle")) { // Pass through our custom JSON parse error
            errorMessage = error.message;
        }
    }
    
    throw new Error(errorMessage);
  }
};