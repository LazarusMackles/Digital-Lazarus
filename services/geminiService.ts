import { type GenerateContentResponse, type Part, type Content } from "@google/genai";
import type { AnalysisResult, AnalysisMode, ForensicMode } from '../types';
import { MODELS } from '../utils/constants';
import { analysisSchema } from '../utils/schemas';

// --- Centralized System Instructions ---
const systemInstructions = {
  textAndUrl: `You are a world-class digital content analyst, a sleuth specializing in text analysis. Your primary directive is to analyze the provided text and determine its origin on the 'Spectrum of Creation'. IMPORTANT: Analyze the text *only*. Do not follow or fetch content from any URLs present in the text. Your analysis must be based solely on the provided string. Your final \`verdict\` MUST be one of the following four options: 1. 'Fully AI-Generated', 2. 'Likely AI-Enhanced', 3. 'Composite: Human & AI', or 4. 'Appears Human-Crafted'.

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

const executeAnalysis = async (payload: any): Promise<Response> => {
  return fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const analyzeContent = async ({
  text,
  images,
  url,
  analysisMode,
  forensicMode,
  systemInstructionPreamble,
}: AnalyzeContentParams): Promise<AnalysisResult> => {
  const modelName = analysisMode === 'deep' ? MODELS.DEEP : MODELS.QUICK;

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
      const payload = {
        model: modelName,
        contents: requestContents,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          systemInstruction,
        }
      };

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          // Pass analysisMode in the error for contextual messaging.
          const timeoutError = new Error("Client-side request timeout.");
          timeoutError.name = 'TimeoutError';
          (timeoutError as any).analysisMode = analysisMode;
          reject(timeoutError);
        }, 9000); // 9 seconds
      });
      
      const response = await Promise.race([
        executeAnalysis(payload),
        timeoutPromise
      ]);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred with the analysis proxy.');
      }

      const result = await response.json();
      return result as AnalysisResult;

  } catch(e: any) {
      console.error("API proxy call failed:", e);
      let errorMessage = "The deductive engine encountered a critical fault. Please try again.";
      
      if (e.name === 'TimeoutError') {
        const mode = (e as any).analysisMode || 'deep'; // Default to deep if mode is not passed
        if (mode === 'deep') {
          errorMessage = "The analysis timed out. This can happen with complex requests on the 'Deep Dive' setting. Please try a 'Quick Scan' or simplify your input.";
        } else {
          errorMessage = "The analysis timed out, which is unusual for a 'Quick Scan'. The deductive engine may be busy. Please try your request again in a moment.";
        }
      } else if (e.message.toLowerCase().includes('quota')) {
          errorMessage = "My circuits are overheating due to high demand! Please wait a moment before trying again (quota exceeded).";
      }
      throw new Error(errorMessage);
  }
};