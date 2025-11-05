import { GoogleGenAI, Type, GenerateContentResponse, Part, Content } from "@google/genai";
import type { AnalysisResult, AnalysisMode, ForensicMode } from '../types';

// Centralized schema for analysis results.
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the probability of AI involvement. For AI-enhanced or composite content, this score should reflect the *degree* of AI contribution to the final image.'
    },
    verdict: {
      type: Type.STRING,
      description: 'A concise verdict from the "Spectrum of Creation". For text, this can be "Fully AI-Generated", "Likely AI-Enhanced", "Composite: Human & AI", or "Appears Human-Crafted". For images, appropriate verdicts like "AI-Assisted Composite" or "AI-Enhanced (Stylistic Filter)" should be used.'
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

// --- Centralized System Instructions ---
const systemInstructions = {
  textAndUrl: `You are a world-class digital content analyst, a sleuth specializing in text analysis. Your primary directive is to analyze the provided text and determine its origin on the 'Spectrum of Creation'. Your final \`verdict\` MUST be one of the following four options: 1. 'Fully AI-Generated', 2. 'Likely AI-Enhanced', 3. 'Composite: Human & AI', or 4. 'Appears Human-Crafted'.

**NEW PARADIGM: THE "COMPOSITE" TEXT**
A new, sophisticated form of content involves a human author explicitly quoting or embedding a block of pure AI-generated text within their own writing. This is NOT 'AI-Enhanced' (where the human's voice is polished). This is a composite piece where two distinct voices are present.

**Indicators of 'Composite: Human & AI' Text (A Human Voice, Presenting AI Content):**
*   **Explicit Attribution:** The human author uses phrases like "Here's what the AI generated:", "I asked an AI to write...", or puts a long, stylistically different passage in quotation marks.
*   **"The Twist":** The author builds a narrative and then reveals a portion of the text was AI-generated as a punchline or a point of discussion.
*   **Clear Stylistic Shift:** The surrounding text is conversational, personal, and may contain slang or rhetorical questions, while the embedded AI text is typically formal, structured, and lacks a personal voice. Your analysis should pinpoint this shift.`
};

// --- Added analyzeContent function ---
interface AnalyzeContentParams {
  text: string | null;
  images: string[] | null;
  url: string | null;
  analysisMode: AnalysisMode;
  forensicMode: ForensicMode;
  systemInstructionPreamble?: string;
}

export const analyzeContent = async ({
  text,
  images,
  url,
  analysisMode,
  forensicMode,
  systemInstructionPreamble,
}: AnalyzeContentParams): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const modelName = analysisMode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  let requestContents: string | Content;
  let systemInstruction = '';

  if (images && images.length > 0) {
    let imageSystemInstruction = `You are a world-class digital forensics expert specializing in image analysis. Your task is to determine if an image is AI-generated, human-made (photograph), or a composite. Your verdict must be on the 'Spectrum of Creation'. For images, appropriate verdicts like "AI-Assisted Composite" or "AI-Enhanced (Stylistic Filter)" should be used.`;
    if (forensicMode === 'technical') {
      imageSystemInstruction += ' Focus *exclusively* on technical artifacts: pixel inconsistencies, lighting, shadows, textures, and signs of digital synthesis. Ignore the conceptual content of the image.'
    } else if (forensicMode === 'conceptual') {
      imageSystemInstruction += ' Focus *exclusively* on conceptual elements: the story, context, plausibility of the scene, and logical consistency. Ignore low-level technical artifacts.'
    } else { // standard
      imageSystemInstruction += ' Provide a balanced analysis, considering both technical artifacts and conceptual plausibility.'
    }
    systemInstruction = imageSystemInstruction;

    const parts: Part[] = [];
    let imagePrompt = `Analyze the provided image(s) and determine their place on the Spectrum of Creation.`;
    if (images.length > 1) {
      imagePrompt += ` The first image is the primary evidence, and the others provide supporting context.`
    }
    parts.push({ text: imagePrompt });

    for (const image of images) {
      const [header, base64Data] = image.split(',');
      if (!base64Data) {
          throw new Error("Invalid image data format. Expected data URL.");
      }
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        }
      });
    }
    requestContents = { parts };
  } else if (text) {
    requestContents = text;
    systemInstruction = systemInstructions.textAndUrl;
  } else if (url) {
    requestContents = `Please analyze the content of the webpage at this URL: ${url}. Provide a summary and then determine its origin on the 'Spectrum of Creation'.`;
    systemInstruction = systemInstructions.textAndUrl;
  } else {
    throw new Error("No content provided for analysis.");
  }

  if (systemInstructionPreamble) {
    systemInstruction = `${systemInstructionPreamble}\n\n${systemInstruction}`;
  }
  
  try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: requestContents,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          systemInstruction,
        }
      });
    
      let jsonText = response.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7, jsonText.length - 3);
      }
      const result = JSON.parse(jsonText) as AnalysisResult;
      return result;
  } catch(e: any) {
      console.error("Gemini API call failed:", e);
      let errorMessage = "The deductive engine encountered a critical fault. Please try again.";
      if (e.message.includes('429') || e.message.includes('resource has been exhausted')) {
          errorMessage = "My circuits are overheating due to high demand! Please wait a moment before trying again (quota exceeded).";
      } else if (e.message.toLowerCase().includes('json')) {
          errorMessage = "The engine returned a malformed response. The digital ghost in the machine is being elusive.";
      }
      throw new Error(errorMessage);
  }
};