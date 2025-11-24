import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';
import { deepAnalysisSchema } from '../utils/schemas';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      if (error instanceof Error && error.message.includes('429')) {
        if (attempt < maxRetries) {
          const waitTime = initialDelay * Math.pow(2, attempt);
          console.warn(`Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`);
          await delay(waitTime);
          continue; 
        }
      }
      throw lastError;
    }
  }
  throw lastError || new Error('Unknown error after retries.');
};

const prepareContentParts = (
  prompt: string,
  files: { name: string; imageBase64: string }[]
): Part[] => {
  const parts: Part[] = [{ text: prompt }];
  if (files.length > 0) {
    files.forEach(file => {
      const base64Data = file.imageBase64.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        });
      }
    });
  }
  return parts;
};

export const analyzeContent = async (
  prompt: string,
  files: { name: string; imageBase64: string }[],
  modelName: string,
  apiKey: string,
) => {
  const ai = new GoogleGenAI({ apiKey });
  const contents = { parts: prepareContentParts(prompt, files) };
  const schema = deepAnalysisSchema;

  try {
    const apiCall = () => ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.0, // Deterministic output to prevent variance
      },
    });

    const response = await withRetry<GenerateContentResponse>(apiCall);
    const responseJson = response.text.trim();
    return JSON.parse(responseJson);
  } catch (error) {
    console.error(`Error during analysis with model ${modelName}:`, error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The Google API key is not valid. Please check it in Settings.');
        }
        if (error.message.includes('429')) {
             throw new Error('Sleuther is in high demand! The analysis could not be completed at this time. Please try again in a moment.');
        }
    }
    throw new Error('The analysis could not be completed due to an unexpected API error.');
  }
};

export const analyzeWithSearch = async (
  prompt: string,
  files: { name: string; imageBase64: string }[],
  modelName: string,
  apiKey: string,
) => {
  const ai = new GoogleGenAI({ apiKey });
  const contents = { parts: prepareContentParts(prompt, files) };

  try {
    const apiCall = () => ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.0, // Deterministic output for consistent provenance checks
      },
    });

    const response = await withRetry<GenerateContentResponse>(apiCall);
    return response;
    
  } catch (error) {
    console.error(`Error during search-grounded analysis with model ${modelName}:`, error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The Google API key is not valid. Please check it in Settings.');
        }
        if (error.message.includes('429')) {
             throw new Error('Sleuther is in high demand! The analysis could not be completed at this time. Please try again in a moment.');
        }
    }
    throw new Error('The provenance analysis could not be completed due to an unexpected API error.');
  }
};