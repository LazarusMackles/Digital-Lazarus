import { Type } from "@google/genai";

// Schema for a detailed, deep-dive analysis. Includes key indicators (highlights).
export const deepAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the probability of AI involvement. For AI-enhanced or composite content, this score should reflect the *degree* of AI contribution to the final image.'
    },
    verdict: {
      type: Type.STRING,
      enum: [
        "Fully AI-Generated",
        "Likely AI-Enhanced",
        "Composite: Human & AI",
        "Appears Human-Crafted",
        "Analysis Inconclusive"
      ],
      description: 'A concise verdict selected from the allowed list.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A single, concise summary statement (under 30 words) that introduces the verdict and key indicators, without repeating their content.'
    },
    highlights: {
      type: Type.ARRAY,
      description: 'A list of 1-3 specific text segments or image features that are key indicators of AI involvement, along with a reason for each.',
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: 'The specific text segment or a description of the image feature (e.g., "Unnatural shadow on the left hand"). This must be a short, descriptive title for the indicator, NOT the raw text or evidence itself.'
          },
          reason: {
            type: Type.STRING,
            description: 'The forensic reason why this is an indicator.'
          }
        },
        required: ['text', 'reason']
      }
    }
  },
  required: ['probability', 'verdict', 'explanation']
};

export const provenanceSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: [
        "Authentic Photograph",
        "AI-Generated",
        "No Online History Found",
        "Analysis Inconclusive"
      ],
      description: 'A concise verdict based on fact-checking and online history.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A concise summary of findings (under 100 words), formatted as a bulleted list if multiple points are needed.'
    }
  },
  required: ['verdict', 'explanation']
};
