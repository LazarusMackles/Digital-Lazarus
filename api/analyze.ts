import { GoogleGenAI, Part } from '@google/genai';
import { deepAnalysisSchema, quickAnalysisSchema } from '../utils/schemas';
import type { AnalysisMode } from '../types';

// Initialize the Google AI client.
// The API key is automatically provided by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to prepare content parts for the API request
const prepareContentParts = (
  prompt: string,
  files: { name: string; imageBase64: string }[]
): Part[] => {
  const parts: Part[] = [{ text: prompt }];
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
  modelName: string
) => {
  const contents = { parts: prepareContentParts(prompt, files) };
  const schema = analysisMode === 'deep' ? deepAnalysisSchema : quickAnalysisSchema;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

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
             throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
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
  onStreamUpdate: (chunk: string) => void
) => {
  const contents = { parts: prepareContentParts(prompt, files) };
  const schema = deepAnalysisSchema;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    let fullResponseText = '';
    for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        fullResponseText += chunkText;
        // The stream provides partial JSON, so we just pass the text up.
        // The service layer will handle parsing it at the end.
        onStreamUpdate(fullResponseText);
    }
    
    // Once streaming is complete, parse the full JSON.
    return JSON.parse(fullResponseText.trim());

  } catch (error) {
    console.error(`Error during streaming analysis with model ${modelName}:`, error);
     if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('Requested entity was not found')) {
            throw new Error('The API key is not valid. Please select a valid key.');
        }
         if (error.message.includes('429')) {
             throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
    }
    throw new Error('The streaming analysis could not be completed due to an unexpected API error.');
  }
};
