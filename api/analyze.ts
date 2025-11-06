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

/**
 * A robust, multi-step function to clean raw HTML and extract meaningful text.
 * This is designed to be performant and avoid catastrophic backtracking.
 * @param html The raw HTML string.
 * @returns A string of cleaned, human-readable text.
 */
function cleanHtml(html: string): string {
    // 1. Remove script and style elements entirely
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // 2. Remove all remaining HTML tags, leaving their content
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');
    
    // 3. Decode common HTML entities
    cleaned = cleaned.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    
    // 4. Normalize whitespace (replace multiple spaces/newlines with a single space)
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

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
            
            // Clean the HTML to extract just the text content.
            const cleanedText = cleanHtml(htmlContent);

            // Use the cleaned text and apply a final truncation as a safeguard.
            const MAX_TEXT_LENGTH = 25000;
            contentForGemini = cleanedText.substring(0, MAX_TEXT_LENGTH);
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