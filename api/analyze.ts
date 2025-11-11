import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';
import { deepAnalysisSchema, quickAnalysisSchema } from '../utils/schemas';
import type { AnalysisMode } from '../types';

// Initialize the Google AI client.
// The API key is automatically provided by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * A helper function to introduce a delay.
 * @param ms The number of milliseconds to wait.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A higher-order function that wraps an API call with a retry mechanism
 * featuring exponential backoff. It specifically targets '429' rate limit errors.
 * @param apiCall The asynchronous function to execute.
 * @param maxRetries The maximum number of retry attempts.
 * @param initialDelay The initial delay in milliseconds before the first retry.
 * @returns A promise that resolves with the result of the API call.
 */
const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      // Check for the specific rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        if (attempt < maxRetries) {
          const waitTime = initialDelay * Math.pow(2, attempt);
          console.warn(`Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`);
          await delay(waitTime);
          continue; // Move to the next attempt
        }
      }
      // If it's not a rate limit error or we've exhausted retries, throw the error.
      throw lastError;
    }
  }
  // This line is technically unreachable but required for TypeScript to be certain.
  throw lastError || new Error('Unknown error after retries.');
};


// Helper to prepare content parts for the API request
const prepareContentParts = (
  prompt: string,
  sanitizedText: string,
  files: { name: string; imageBase64: string }[]
): Part[] => {
  const parts: Part[] = [{ text: prompt }];
  // If there's sanitized text, add it as a separate part.
  if (sanitizedText) {
      parts.push({ text: `\n\n---BEGIN EVIDENCE---\n${sanitizedText}\n---END EVIDENCE---`});
  }
  if (files.length > 0) {
    files.forEach(file => {
      // The base64 string includes the data URL prefix, which needs to be removed.
      const base64Data = file.imageBase64.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg', // Compression utility standardizes to jpeg
            data: base64Data,
          },
        });
      }
    });
  }
  return parts;
};

// Function to perform a standard, non-streaming analysis
export const analyzeContent = async (
  prompt: string,
  files: { name: string; imageBase64: string }[],
  analysisMode: AnalysisMode,
  modelName: string,
  sanitizedText: string = ''
) => {
  const contents = { parts: prepareContentParts(prompt, sanitizedText, files) };
  const schema = analysisMode === 'deep' ? deepAnalysisSchema : quickAnalysisSchema;

  try {
    const apiCall = () => ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    // FIX: Explicitly provide the generic type to `withRetry` to ensure `response` is correctly typed
    // as `GenerateContentResponse`, resolving the error on `response.text`.
    const response = await withRetry<GenerateContentResponse>(apiCall);

    // The response.text property contains the full text string, which should be JSON.
    const responseJson = response.text.trim();
    return JSON.parse(responseJson);
  } catch (error) {
    console.error(`Error during analysis with model ${modelName}:`, error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('Requested entity was not found')) {
            throw new Error('The API key is not valid. Please select a valid key.');
        }
        if (error.message.includes('429')) {
             throw new Error('Sleuther is in high demand! The analysis could not be completed at this time. Please try again in a moment.');
        }
    }
    throw new Error('The analysis could not be completed due to an unexpected API error.');
  }
};

// Function to perform a streaming analysis for deep dives
export const analyzeContentStream = async (
  prompt: string,
  files: { name: string; imageBase64: string }[],
  modelName: string,
  onStreamUpdate: (chunk: string) => void,
  sanitizedText: string = ''
) => {
  const contents = { parts: prepareContentParts(prompt, sanitizedText, files) };
  // RESTORED: The diagnostic is over. We now restore the correct schema selection logic
  // to prepare for the "Prompt Efficiency Audit".
  const schema = deepAnalysisSchema;

  try {
    const apiCall = () => ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    // FIX: Explicitly provide the generic type to `withRetry` to ensure `responseStream` is correctly
    // typed as an async iterator, resolving the "does not have a '[Symbol.asyncIterator]'" error.
    const responseStream = await withRetry<AsyncGenerator<GenerateContentResponse>>(apiCall);

    let fullResponseText = '';
    for await (const chunk of responseStream) {
        // FIX: The streaming response for JSON returns the full text so far in each chunk.
        // Appending the chunks (`+=`) was causing exponential string growth and hanging the app.
        // This now correctly replaces the text with the latest, most complete chunk.
        fullResponseText = chunk.text;
        // The stream provides partial JSON, so we just pass the text up.
        // The service layer will handle parsing it at the end.
        onStreamUpdate(fullResponseText);
    }
    
    // Once streaming is complete, parse the full JSON.
    return JSON.parse(fullResponseText.trim());

  } catch (error)
      {
    console.error(`Error during streaming analysis with model ${modelName}:`, error);
     if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('Requested entity was not found')) {
            throw new Error('The API key is not valid. Please select a valid key.');
        }
         if (error.message.includes('429')) {
             throw new Error('Sleuther is in high demand! The analysis could not be completed at this time. Please try again in a moment.');
        }
    }
    throw new Error('The streaming analysis could not be completed due to an unexpected API error.');
  }
};