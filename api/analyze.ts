import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { InputType, ForensicMode } from '../types';
import type { Part } from "@google/genai";
import { MODELS } from '../utils/constants';

const getSystemInstruction = (type: InputType, mode: ForensicMode, preamble?: string): string => {
    const baseInstruction = `You are "Sleuther Vanguard," a world-class digital forensics AI. Your mission is to analyze the provided evidence and determine its origin, focusing on forensic artifacts. You MUST return your findings ONLY in the following plain-text format, with each field on a new line:

PROBABILITY: [A number from 0-100]
VERDICT: [A short verdict from the "Spectrum of Creation"]
EXPLANATION: [A brief, single-paragraph explanation]
HIGHLIGHT 1: [The highlighted text or a description of an image feature] - [The reason this is an indicator]
HIGHLIGHT 2: [Optional second highlight] - [The reason]
HIGHLIGHT 3: [Optional third highlight] - [The reason]

Do not include any other text, formatting, or markdown.`;

    const imageSpecifics = {
        standard: "Your analysis of this image should be a balanced view of technical and conceptual clues.",
        technical: "Your analysis of this image should focus ONLY on technical artifacts like pixel patterns, lighting, and synthesis artifacts.",
        conceptual: "Your analysis of this image should focus ONLY on conceptual clues like the story, context, and plausibility."
    };
    
    const textSpecifics = "Your analysis of this text should focus ONLY on linguistic patterns like style, syntax, and phrasing.";

    const angle = type === 'file' ? imageSpecifics[mode] : textSpecifics;
    const fullInstruction = `${baseInstruction}\n\nYour specific forensic angle for this case is: ${angle}`;

    return preamble ? `${preamble}\n\n${fullInstruction}` : fullInstruction;
};


export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return new Response(JSON.stringify({ message: "API key is missing." }), { status: 401 });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const {
            text,
            images,
            analysisMode,
            forensicMode,
            systemInstructionPreamble,
            activeInput,
        } = await request.json();

        const analysisModelName = activeInput === 'file' ? MODELS.DEEP : MODELS.QUICK;

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
             return new Response(JSON.stringify({ message: "No content provided for analysis." }), { status: 400 });
        }
        
        const systemInstruction = getSystemInstruction(activeInput, forensicMode, systemInstructionPreamble);
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: analysisModelName,
            contents: { parts },
            config: {
                systemInstruction,
                // No JSON schema - we are requesting plain text for speed.
            },
        });

        if (!response.text) {
             return new Response(JSON.stringify({ message: "The analysis engine returned a blank response. The request may have been blocked or the model could not produce a valid result." }), { status: 500 });
        }

        return new Response(JSON.stringify({ result: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in analysis function:", error);
        return new Response(JSON.stringify({ 
            message: error.message || "An unexpected error occurred in the deductive engine."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}