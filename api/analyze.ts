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
        const finalConfig = { ...body.config };

        // If this is a URL analysis, fetch and clean the content on the server.
        if (body.activeInput === 'url' && typeof body.contents === 'string' && body.contents.startsWith('http')) {
            const urlToFetch = body.contents;
            console.log(`Fetching content from URL: ${urlToFetch}`);
            
            const controller = new AbortController();
            const fetchTimeout = setTimeout(() => controller.abort(), 15000);

            let urlResponse;
            try {
                urlResponse = await fetch(urlToFetch, {
                    signal: controller.signal,
                    headers: { 'User-Agent': 'SleutherVanguardBot/1.0' }
                });
            } finally {
                clearTimeout(fetchTimeout);
            }
            
            if (!urlResponse.ok) {
                throw new Error(`Failed to fetch the URL. Status: ${urlResponse.status}`);
            }
            
            const htmlContent = await urlResponse.text();
            
            // Instead of cleaning, which is slow and brittle, send the raw HTML and let the model parse it.
            // Truncate the raw HTML to a safe but generous limit to prevent overly large payloads.
            const MAX_HTML_LENGTH = 50000;
            contentForGemini = htmlContent.substring(0, MAX_HTML_LENGTH);
            
            // Add a notice to the AI if the content was truncated.
            if (htmlContent.length > MAX_HTML_LENGTH) {
                finalConfig.systemInstruction = `IMPORTANT: The following HTML source code has been truncated for performance. Your analysis should be based solely on this partial data.\n\n${finalConfig.systemInstruction}`;
            }
        }


        // Reconstruct the request for the actual Gemini SDK using the client's payload.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: body.model,
            contents: contentForGemini,
            config: finalConfig,
        });

        if (!response.text || typeof response.text !== 'string') {
            throw new Error("Received an empty or invalid response from the generative model.");
        }

        const jsonResult = JSON.parse(response.text);

        return new Response(JSON.stringify(jsonResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in serverless proxy function:", error);
        
        let errorMessage = error.message || "An internal server error occurred.";
        if (error.name === 'AbortError') {
            errorMessage = "The target website did not respond in time. Please try a different URL or check if the site is online.";
        }
        
        return new Response(JSON.stringify({ 
            message: errorMessage
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}