import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { InputType, ForensicMode, AnalysisMode } from '../types';
import type { Part } from "@google/genai";
import { MODELS } from '../utils/constants';
import { quickAnalysisSchema, deepAnalysisSchema } from '../utils/schemas';

const getSystemInstruction = (
    type: InputType,
    forensicMode: ForensicMode,
    analysisMode: AnalysisMode,
    preamble?: string
): string => {
    let baseInstruction = `You are "Sleuther Vanguard," a world-class digital forensics AI. Your mission is to analyze the provided evidence and determine its origin, focusing on forensic artifacts. Your entire response must be in the form of the provided JSON schema.`;

    if (analysisMode === 'quick') {
        baseInstruction += ` For this Quick Scan, your analysis must be extremely fast and your explanation concise (2-3 sentences max).`;
    }

    const imageSpecifics = {
        standard: "Your analysis of this image should be a balanced view of technical and conceptual clues.",
        technical: "Your analysis of this image should focus ONLY on technical artifacts like pixel patterns, lighting, and synthesis artifacts.",
        conceptual: "Your analysis of this image should focus ONLY on conceptual clues like the story, context, and plausibility."
    };
    
    const textSpecifics = "Your analysis of this text should focus ONLY on linguistic patterns like style, syntax, and phrasing.";

    const angle = type === 'file' ? imageSpecifics[forensicMode] : textSpecifics;
    const fullInstruction = `${baseInstruction}\n\nYour specific forensic angle for this case is: ${angle}`;

    return preamble ? `${preamble}\n\n${fullInstruction}` : fullInstruction;
};


export async function POST(request: Request) {
    try {
        if (!process.env.API_KEY) {
            return new Response(JSON.stringify({ message: "API key is not configured in the environment. Please select a key in the AI Studio environment." }), { status: 500 });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const {
            text,
            images,
            analysisMode,
            forensicMode,
            systemInstructionPreamble,
            activeInput,
        } = await request.json();

        const analysisModelName = activeInput === 'file' ? MODELS.DEEP : MODELS.QUICK;
        const schema = analysisMode === 'quick' ? quickAnalysisSchema : deepAnalysisSchema;

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
        
        const systemInstruction = getSystemInstruction(activeInput, forensicMode, analysisMode, systemInstructionPreamble);
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: analysisModelName,
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const responseText = response.text;
        if (!responseText) {
             return new Response(JSON.stringify({ message: "The analysis engine returned a blank response. The request may have been blocked or the model could not produce a valid result." }), { status: 500 });
        }
        
        const resultObject = JSON.parse(responseText);

        return new Response(JSON.stringify({ result: resultObject }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in analysis function:", error);
        if (error.message?.includes('API key not valid')) {
             return new Response(JSON.stringify({ 
                message: "API key not valid. Please make sure the API key selected in the previous step is correct and has the necessary permissions."
            }), {
                status: 401, // Unauthorized
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ 
            message: error.message || "An unexpected error occurred in the deductive engine."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}