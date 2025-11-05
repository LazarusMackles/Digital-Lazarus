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
    highlights: {
      type: Type.ARRAY,
      description: "An array of specific examples or artifacts that justify the verdict. For composites, identify which elements appear photographic and which appear AI-generated. For stylistic filters, describe the visual evidence of the filter. If no specific highlights are found, return an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The exact phrase/sentence from the text, or a short description of a visual artifact (e.g., 'Central photographic subject', 'AI-generated barcode graphic', 'Uniform vintage film grain')."
          },
          reason: {
            type: Type.STRING,
            description: "A brief explanation of why this specific highlight is an indicator of its place on the spectrum of creation, noting if it appears human, AI-generated, or AI-filtered."
          }
        },
        required: ["text", "reason"]
      }
    }
  },
  required: ['probability', 'verdict', 'explanation', 'highlights']
};
