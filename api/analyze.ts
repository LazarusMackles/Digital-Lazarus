/**
 * NOTE: This is a server-side function.
 * 
 * This file should be deployed as a serverless function (e.g., on Vercel, Netlify,
 * or Google Cloud Functions) at the endpoint '/api/analyze'. It acts as a secure
 * proxy between the client application and the Google Gemini API.
 * 
 * Its purpose is to:
 * 1. Receive analysis requests from the client application.
 * 2. If the request is for a URL, fetch the content of that URL.
 * 3. Securely append the `API_KEY` which is stored as an environment variable
 *    on the server, never exposing it to the client.
 * 4. Forward the request to the real Gemini API with the appropriate content.
 * 5. Parse the response from Gemini and return a clean JSON object to the client.
 * 6. Handle any errors gracefully.
 */
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { analysisSchema } from '../utils/schemas';

// This function assumes it's running in a server environment
// where `process.env.API_KEY` is securely configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This handler function's signature is designed to be compatible with modern
// serverless environments like Vercel Edge Functions or Next.js API Routes.
export async function POST(request: Request) {
    try {
        // The request body from the client contains the analysis parameters.
        const body = await request.json();
        
        let contentForGemini = body.contents;

        // If this is a URL analysis, fetch the content on the server.
        if (body.activeInput === 'url' && typeof body.contents === 'string' && body.contents.startsWith('http')) {
            const urlToFetch = body.contents;
            console.log(`Fetching content from URL: ${urlToFetch}`);
            
            const urlResponse = await fetch(urlToFetch, {
                headers: { 'User-Agent': 'SleutherVanguardBot/1.0' }
            });
            
            if (!urlResponse.ok) {
                throw new Error(`Failed to fetch the URL. Status: ${urlResponse.status}`);
            }
            
            // We pass the entire HTML to Gemini, the system prompt will instruct it
            // on how to parse it.
            const htmlContent = await urlResponse.text();
            contentForGemini = htmlContent;
        }


        // Reconstruct the request for the actual Gemini SDK using the client's payload.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: body.model,
            contents: contentForGemini,
            config: body.config,
        });

        // Add a defensive check: Ensure the response text is a non-empty string before parsing.
        // This handles cases where the model might be blocked for safety or returns an unexpected response.
        if (!response.text || typeof response.text !== 'string') {
            throw new Error("Received an empty or invalid response from the generative model.");
        }

        // When using `responseSchema`, the Gemini API returns a JSON string in the `.text` property.
        // We parse it on the server so the client receives a clean JSON object.
        const jsonResult = JSON.parse(response.text);

        // Return the successful JSON response to the client with a 200 status.
        return new Response(JSON.stringify(jsonResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in serverless proxy function:", error);
        
        // Return a structured error message to the client with a 500 status.
        return new Response(JSON.stringify({ 
            message: error.message || "An internal server error occurred." 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}