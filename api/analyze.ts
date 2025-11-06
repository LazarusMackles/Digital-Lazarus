
/**
 * NOTE: This is a server-side function.
 * 
 * This file should be deployed as a serverless function (e.g., on Vercel, Netlify,
 * or Google Cloud Functions) at the endpoint '/api/analyze'. It acts as a secure
 * proxy between the client application and the Google Gemini API.
 * 
 * Its purpose is to:
 * 1. Receive analysis requests from the client application.
 * 2. Securely append the `API_KEY` which is stored as an environment variable
 *    on the server, never exposing it to the client.
 * 3. Forward the request to the real Gemini API with the appropriate content.
 * 4. Parse the response from Gemini and return a clean JSON object to the client.
 * 5. Handle any errors gracefully.
 */
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { analysisSchema } from '../utils/schemas';
import type { AnalysisMode, ForensicMode, InputType, AnalysisResult } from '../types';
import type { Part } from "@google/genai";

// Centralized constants
const MODELS = {
  QUICK: 'gemini-2.5-flash',
  DEEP: 'gemini-2.5-pro',
  FORMATTING: 'gemini-2.5-flash', // Always use the fastest model for simple formatting
};

// --- SYSTEM INSTRUCTIONS RE-ARCHITECTED FOR ROBUSTNESS (TWO-STEP PROCESS) ---

// Step 1: Get instructions for the initial, free-form analysis.
const getAnalysisInstruction = (type: InputType, mode: ForensicMode, preamble?: string): string => {
    const base = `You are a world-class digital forensics expert specializing in AI-generated content detection. Your sole mission is to analyze the provided evidence and return a detailed, plain-text explanation of your findings. CRITICAL: Your analysis must IGNORE the subject matter and focus ONLY on detectable patterns and artifacts. First, state your final verdict from the "Spectrum of Creation". Second, state the probability of AI involvement from 0 to 100. Third, provide a comprehensive explanation for your reasoning.`;

    const imageSpecifics = {
        standard: "For this image analysis, provide a balanced verdict considering both technical artifacts (pixels, lighting) and conceptual clues (context, plausibility).",
        technical: "For this image analysis, focus your verdict exclusively on technical artifacts (pixels, lighting, compression). Ignore conceptual clues.",
        conceptual: "For this image analysis, focus your verdict exclusively on conceptual clues (story, context, plausibility). Ignore technical artifacts."
    };
    
    const textSpecifics = "For this text analysis, focus your verdict on linguistic patterns (style, syntax, complexity).";

    let instruction = base;
    if (type === 'file') {
        instruction += `\n\n${imageSpecifics[mode]}`;
    } else {
        instruction += `\n\n${textSpecifics}`;
    }

    return preamble ? `${preamble}\n\n${instruction}` : instruction;
};

// Step 2: Get instructions for formatting the analysis into JSON.
const getFormattingInstruction = (analysisText: string): string => {
    return `You are a data formatting expert. Your only task is to take the following forensic analysis text and convert it perfectly into the provided JSON schema. Do not add any new information or change the meaning. Extract the probability, verdict, and explanation accurately from the text. The analysis text is:\n\n---\n${analysisText}\n---`;
}


// This function assumes it's running in a server environment
// where `process.env.API_KEY` is securely configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// This handler function's signature is designed to be compatible with modern
// serverless environments like Vercel Edge Functions or Next.js API Routes.
export async function POST(request: Request) {
    try {
        const {
            text,
            images,
            analysisMode,
            forensicMode,
            systemInstructionPreamble,
            activeInput,
        }: {
            text: string | null;
            images: string[] | null;
            analysisMode: AnalysisMode;
            forensicMode: ForensicMode;
            systemInstructionPreamble?: string;
            activeInput: InputType;
        } = await request.json();

        const modelName = analysisMode === 'deep' ? MODELS.DEEP : MODELS.QUICK;

        // --- CONSTRUCT CONTENT FOR ANALYSIS ---
        const parts: Part[] = [];
        if (activeInput === 'file' && images && images.length > 0) {
             let imagePrompt = `Analyze the provided image(s).`;
            if (images.length > 1) {
                imagePrompt += ` The first image is the primary evidence.`
            }
            parts.push({ text: imagePrompt });

            for (const image of images) {
                const [header, base64Data] = image.split(',');
                if (!base64Data) continue;
                const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
                parts.push({ inlineData: { mimeType, data: base64Data } });
            }
        } else if (activeInput === 'text' && text) {
            parts.push({ text });
        } else {
             throw new Error("No content provided for analysis.");
        }

        // --- STEP 1: PERFORM THE FREE-FORM ANALYSIS ---
        const analysisInstruction = getAnalysisInstruction(activeInput, forensicMode, systemInstructionPreamble);
        const analysisResponse: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
                systemInstruction: analysisInstruction,
            },
        });

        const analysisText = analysisResponse.text;
        if (!analysisText) {
             throw new Error("The initial analysis failed to produce a result.");
        }

        // --- STEP 2: FORMAT THE ANALYSIS INTO JSON ---
        const formattingInstruction = getFormattingInstruction(analysisText);
        const formattingResponse: GenerateContentResponse = await ai.models.generateContent({
            model: MODELS.FORMATTING,
            contents: [{ text: formattingInstruction }],
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        if (!formattingResponse.text) {
            throw new Error("The analysis engine returned a blank response during the final formatting step.");
        }
        
        const jsonResult: AnalysisResult = JSON.parse(formattingResponse.text.trim());

        return new Response(JSON.stringify(jsonResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in serverless proxy function:", error);
        
        let errorMessage = error.message || "An internal server error occurred.";
        
        // Provide more specific feedback if the model response was blocked
        if (error.toString().includes('response was blocked')) {
            errorMessage = "The analysis was blocked by the safety filter. This can happen with sensitive or unusual images. Please try different evidence.";
        }
        
        return new Response(JSON.stringify({ 
            message: errorMessage
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}