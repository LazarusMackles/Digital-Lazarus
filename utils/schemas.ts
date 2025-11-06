import { Type } from "@google/genai";

// Centralized schema for analysis results.
export const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the probability of AI involvement. For AI-enhanced or composite content, this score should reflect the *degree* of AI contribution to the final image.'
    },
    verdict: {
      type: Type.STRING,
      description: 'A concise verdict from the "Spectrum of Creation". For text, this can be "Fully AI-Generated", "Likely AI-Enhanced", "Composite: Human & AI", or "Appears Human-Crafted". For images, appropriate verdicts like "AI-Assisted Composite" or "AI-Enhanced (Stylistic Filter)" should be used.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief explanation for the verdict, tailored to whether the content appears fully generated, a composite, enhanced by AI filters/styles, or an authentic photograph.'
    },
    // The 'highlights' property has been removed to reduce model processing time and prevent timeouts.
    // The frontend is designed to handle its absence gracefully.
  },
  required: ['probability', 'verdict', 'explanation']
};