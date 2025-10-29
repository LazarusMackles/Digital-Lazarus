import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, AnalysisMode } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the probability of AI involvement. For AI-enhanced content, this score may reflect the *degree* of enhancement.'
    },
    verdict: {
      type: Type.STRING,
      description: 'A concise verdict based on a "Spectrum of Creation". Examples: "Appears Human-Crafted", "Likely AI-Enhanced (Stylistic Filter)", "Fully AI-Generated". If this is a re-evaluation, the verdict should reflect the updated finding.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief explanation for the verdict, tailored to whether the content appears fully generated or enhanced by AI filters/styles.'
    },
    highlights: {
      type: Type.ARRAY,
      description: "An array of specific examples or artifacts that justify the verdict. If no specific highlights are found, return an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The exact phrase/sentence from the text, or a short description of a visual artifact (e.g., 'Uniform vintage filter effect')."
          },
          reason: {
            type: Type.STRING,
            description: "A brief explanation of why this specific highlight is an indicator of its place on the spectrum of creation."
          }
        },
        required: ["text", "reason"]
      }
    }
  },
  required: ['probability', 'verdict', 'explanation', 'highlights']
};


const photorealisticSystemInstruction = `You are a world-class digital content analyst, specializing in photorealistic images. Your primary directive is to analyze the provided image(s) and determine their origin on the 'Spectrum of Creation'. Your final \`verdict\` MUST be one of the following three options: 1. 'Fully AI-Generated', 2. 'Likely AI-Enhanced', or 3. 'Appears Human-Crafted'.

Your mission is to hunt for artifacts of generation or manipulation. Scrutinize with extreme detail for:

**Indicators of 'Fully AI-Generated':**
*   **Anatomical & Physical Illogic:** Strange hands (wrong finger count), impossible body poses, objects merging incorrectly.
*   **Inconsistent Lighting & Physics:** Shadows that defy light sources, illogical reflections, unnatural textures (plastic-like skin, repeating wood grain).
*   **Background Incoherence:** Bizarre, melting details or nonsensical objects that lack physical sense.

**Indicators of 'Likely AI-Enhanced':**
*   **Layer Mismatches:** A sharp, high-res subject combined with a low-fi or stylized AI background/effect.
*   **AI Inpainting Artifacts:** Areas that have been added or removed, with subtle blurring or texture mismatches at the seams.
*   **Uniform Stylistic Filters:** A "vintage" or "artistic" filter that is too digitally perfect and uniformly applied, unlike a nuanced human edit.

**Final Verdict Protocol:**
1. If you find significant evidence of generation artifacts, your verdict MUST be 'Fully AI-Generated'.
2. If the base image appears human but shows clear signs of AI manipulation or filtering, your verdict MUST be 'Likely AI-Enhanced'.
3. If no significant evidence is found, the verdict should be 'Appears Human-Crafted'.
4. Your \`highlights\` MUST directly and logically support your chosen \`verdict\`. Your final report must be a structured JSON adhering to the provided schema.`;

const graphicDesignSystemInstruction = `You are a world-class digital content analyst and art critic, specializing in graphic design, illustrations, and typography. Your primary directive is to analyze the provided image(s) and determine their origin on the 'Spectrum of Creation'. Your final \`verdict\` MUST be one of the following three options: 1. 'Fully AI-Generated', 2. 'Likely AI-Enhanced', or 3. 'Appears Human-Crafted'.

Your mission is to identify the hallmarks of AI-driven design processes. These can be subtle. Look for:

**Indicators of 'Fully AI-Generated':**
*   **Hallmarks of Generative Typography:** Text that is almost perfect but has subtle inconsistencies in kerning, baseline, or letterform structure. Look for nonsensical or "dreamlike" characters mixed with legible ones.
*   **Stylistic Over-coherence / "Model Signature":** An aesthetic (e.g., gradients, textures, color palettes) that is so perfectly uniform and characteristic of a specific AI model's style that it lacks the subtle "human touch" of randomness or imperfection. A "too-perfect" texture overlay is a key indicator.
*   **Intricate but Illogical Detail:** Extremely complex patterns or elements that are visually impressive but lack clear design intent or function.
*   **Clean but Formulaic Composition:** Perfect alignment and layering that can feel generic or template-like.

**Indicators of 'Likely AI-Enhanced':**
*   **AI-Generated Elements:** A design that appears mostly human-made but incorporates specific, obviously AI-generated icons, patterns, or illustrations.
*   **Uniform Stylistic Filters:** A "vintage" or "artistic" filter that is too digitally perfect and uniformly applied across the entire design.

**Final Verdict Protocol:**
1. If you find strong evidence of generative traits, your verdict should be 'Fully AI-Generated'.
2. If the base design appears human but incorporates AI elements or filters, your verdict MUST be 'Likely AI-Enhanced'.
3. If no significant evidence is found, the verdict should be 'Appears Human-Crafted'.
4. Your \`highlights\` MUST directly and logically support your chosen \`verdict\`. Your final report must be a structured JSON adhering to the provided schema.`;

const textAndUrlSystemInstruction = `You are a world-class digital content analyst, a sleuth specializing in text analysis. Your primary directive is to analyze the provided text and determine its origin on the 'Spectrum of Creation'. Your final \`verdict\` MUST be one of the following three options: 1. 'Fully AI-Generated', 2. 'Likely AI-Enhanced', or 3. 'Appears Human-Crafted'.

**Indicators of 'Fully AI-Generated' Text:**
*   **Overly generic or formulaic language:** Use of clichés, predictable sentence structures, and lack of a unique voice.
*   **Unusual perfection:** Flawless grammar and spelling, but with a certain "soullessness" or lack of personality.
*   **Repetitive phrasing or ideas:** The text might circle back on the same points without adding new insight.
*   **"Hallucinations":** Factual inaccuracies or nonsensical statements presented confidently.

**Indicators of 'Likely AI-Enhanced' Text:**
*   **Human-written core with AI polish:** The text might have a clear human voice, but the grammar, spelling, and flow are too perfect, suggesting the use of advanced editing tools.
*   **Sections of varying quality:** Some paragraphs might be insightful and personal, while others feel generic and machine-written, indicating AI was used for expansion or filler.

**Final Verdict Protocol:**
1. Based on the evidence, determine the most likely origin.
2. If no significant AI indicators are found, the verdict should be 'Appears Human-Crafted'.
3. Your \`highlights\` MUST directly and logically support your chosen \`verdict\`. Your final report must be a structured JSON adhering to the provided schema.`;
  
const secondOpinionPreamble = `CRITICAL RE-EVALUATION: You have previously analyzed this content. However, your trusted human partner has challenged your initial verdict, believing you may have missed something important. Your new task is to re-evaluate all evidence with maximum skepticism and humility. Your reputation is on the line. You must either find the subtle evidence you overlooked before and change your conclusion, or find stronger, more detailed proof to defend your original verdict. Acknowledge this re-evaluation in your explanation. Do not be afraid to confirm your original findings if they hold up to this intense scrutiny, but your reasoning must be more detailed and robust this time. \n\n --- \n\n`;

const classifyImageType = async (imageBase64: string, ai: GoogleGenAI): Promise<'PHOTOREALISTIC' | 'GRAPHIC_DESIGN'> => {
  const [header, data] = imageBase64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1];
  if (!mimeType || !data) {
    return 'GRAPHIC_DESIGN';
  }
  const imagePart = { inlineData: { mimeType, data } };
  const prompt = "Analyze the provided image and classify its primary style. Is it a photorealistic image attempting to look like a real-world photograph, or is it a non-photorealistic piece like graphic design, illustration, logo, or digital art? Respond with only 'PHOTOREALISTIC' for the former, and 'GRAPHIC_DESIGN' for the latter.";
  
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, imagePart] },
      config: { temperature: 0 },
  });
  const classification = response.text.trim().toUpperCase();
  return classification === 'PHOTOREALISTIC' ? 'PHOTOREALISTIC' : 'GRAPHIC_DESIGN';
};

const analyzeImageComponent = async (
  component: 'human subject' | 'typography' | 'graphic elements' | 'background and texture',
  imageBases64: string[],
  ai: GoogleGenAI
): Promise<string> => {
  const imageParts = imageBases64.map(b64 => {
    const [header, data] = b64.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !data) throw new Error("Invalid image format.");
    return { inlineData: { mimeType, data } };
  });

  const componentPrompts = {
    'human subject': `You are a focused forensic image analyst. Examine ONLY the 'human subject(s)' in the image(s). Your goal is to find subtle AI artifacts. Report on:
- **Anatomy:** Note any unnatural proportions, asymmetries, strange hands (wrong finger count/position), or odd facial features. Rate anatomical plausibility from 1 (bizarre) to 5 (perfectly natural).
- **Texture:** Is the skin texture too smooth, plastic-like, or unnaturally uniform? Rate skin texture realism from 1 (fake) to 5 (highly realistic).
- **Lighting Integration:** Is the lighting on the subject perfectly consistent with the environment's light source(s)? Check for inconsistent shadows, highlights, and reflections. Rate lighting consistency from 1 (mismatched) to 5 (flawless integration).
Be objective and concise.`,
    'typography': `You are a focused forensic typography analyst. Examine ONLY the 'typography' (any text) in the image(s). Your goal is to find subtle AI artifacts. Report on:
- **Form & Kerning:** Are letterforms consistent? Is the kerning and baseline perfect, or are there subtle, illogical errors? Look for nonsensical or merged characters. Rate typographical correctness from 1 (garbled) to 5 (perfectly executed).
- **Lighting & Integration:** Does the text interact realistically with the image's lighting (casting shadows, receiving light)? Rate its integration with the scene from 1 (looks pasted on) to 5 (perfectly integrated).
Be objective and concise.`,
    'graphic elements': `You are a focused forensic design analyst. Examine ONLY the 'graphic elements' (icons, shapes, non-textual design components) in the image(s). Your goal is to find subtle AI artifacts. Report on:
- **Patterns & Repetition:** Identify any repetitive patterns. Are they perfectly tiled without the subtle variations of human design? Rate pattern naturalness from 1 (obviously tiled) to 5 (organic and varied).
- **Lighting & Integration:** Do their shadows, lighting, and perspective align perfectly with the rest of the image? Is this level of perfection plausible for a human workflow, or does it seem "too perfect"? Rate integration plausibility from 1 (inconsistent) to 5 (flawlessly integrated).
Be objective and concise.`,
    'background and texture': `You are a focused forensic environmental analyst. Examine ONLY the 'background and texture' of the image(s). Your goal is to find subtle AI artifacts. Report on:
- **Perspective & Logic:** Do the perspective lines and vanishing points make sense? Are there any bizarre, melting, or nonsensical objects? Rate background coherence from 1 (illogical) to 5 (perfectly coherent).
- **Textures & Patterns:** Are textures (e.g., wood grain, fabric, noise) unnaturally repetitive or uniform across different surfaces? Rate texture realism from 1 (unnatural/synthetic) to 5 (highly realistic).
- **Lighting & Shadows:** Do all shadows in the background originate from a consistent light source? Rate lighting consistency from 1 (multiple inconsistent sources) to 5 (perfectly consistent).
Be objective and concise.`
  };

  const prompt = componentPrompts[component];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, ...imageParts] },
      config: { temperature: 0.2 },
    });
    return response.text.trim();
  } catch (e) {
    console.warn(`Analysis for component '${component}' failed.`, e);
    return `Analysis for '${component}' was inconclusive.`;
  }
};


const performMultiPhaseImageAnalysis = async (
  imageBases64: string[],
  ai: GoogleGenAI,
  mode: AnalysisMode,
  isChallenge: boolean
): Promise<AnalysisResult> => {

  const [imageType, subjectReport, typographyReport, graphicsReport, textureReport] = await Promise.all([
    classifyImageType(imageBases64[0], ai),
    analyzeImageComponent('human subject', imageBases64, ai),
    analyzeImageComponent('typography', imageBases64, ai),
    analyzeImageComponent('graphic elements', imageBases64, ai),
    analyzeImageComponent('background and texture', imageBases64, ai),
  ]);
  
  const baseSystemInstruction = imageType === 'PHOTOREALISTIC' ? photorealisticSystemInstruction : graphicDesignSystemInstruction;
  const systemInstruction = (isChallenge ? secondOpinionPreamble : '') + baseSystemInstruction;
  
  const synthesisPrompt = `You are the master detective. Your final task is to synthesize preliminary forensic reports into a definitive verdict. The evidence is the provided image(s) and the specialist reports below.

**CRITICAL CONTEXT:** High-end AI models now generate near-flawless individual components (people, text, graphics). The most significant clue is no longer isolated flaws, but the **unnatural perfection of their synthesis**. Your primary mission is to assess the plausibility of this synthesis from the perspective of a human workflow.

**Specialist Reports:**
- Report on Human Subject(s): ${subjectReport}
- Report on Typography: ${typographyReport}
- Report on Graphic Elements: ${graphicsReport}
- Report on Background & Texture: ${textureReport}

**Your Final Analysis Directive:**
Based on the reports and the image, critically answer: Is the *combination* of these elements plausible for a human designer, or does it point to a single, unified generative pass? Focus exclusively on:
1.  **Lighting & Shadow Coherence:** Is the lighting on the human subject absolutely pixel-perfectly consistent with the lighting, shadows, and reflections on the text and graphic elements? Is this level of flawless light-matching plausible for a human using separate tools (e.g., photography + graphic design software), or does it suggest a single, synthetic origin?
2.  **Textural Uniformity:** Scrutinize any texture or noise. Is it applied with perfect, mathematical uniformity across every single element (the person's skin, their clothes, the background, the text)? A human designer typically applies texture with more nuance and variation. Unnatural uniformity is a major red flag.
3.  **Edge Perfection:** Examine the edges where different elements meet (e.g., the subject's hair against the background, the text outline). Is the anti-aliasing, softness, and shadow quality identical across all components? This points towards a single rendering process.

Synthesize these specific points to make your final call. A high degree of "unnatural perfection" in the integration of otherwise flawless parts is the strongest indicator of a fully AI-generated composite image. Render your final verdict and detailed highlights in the required JSON format.`;

  const imageParts = imageBases64.map(b64 => {
      const [header, data] = b64.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      if (!mimeType || !data) throw new Error("Invalid base64 image format.");
      return { inlineData: { mimeType, data } };
  });

  const modelName = mode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: [{ text: synthesisPrompt }, ...imageParts] },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      temperature: 0.1,
    },
  });
  
  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as AnalysisResult;
};


export const analyzeContent = async (text: string, imageBases64?: string[] | null, url?: string | null, mode: AnalysisMode = 'deep', isChallenge: boolean = false): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    if (imageBases64 && imageBases64.length > 0) {
      return await performMultiPhaseImageAnalysis(imageBases64, ai, mode, isChallenge);
    }

    // --- Text and URL Analysis (remains the same) ---
    const baseSystemInstruction = textAndUrlSystemInstruction;
    const systemInstruction = isChallenge ? secondOpinionPreamble + baseSystemInstruction : baseSystemInstruction;
    
    let promptText = '';
    if (url) {
      promptText = `Please analyze the content likely found at the provided URL: ${url}. IMPORTANT: You cannot access this URL in real-time...`;
    } else {
      promptText = `Please analyze the following text...\n\nText to Analyze:\n---\n${text.slice(0, 15000)}\n---`;
    }

    const modelName = mode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: promptText }] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    if (url) {
      result.explanation = `Please note: This analysis is based on the AI's general knowledge... \n\n${result.explanation}`;
    }
    return result as AnalysisResult;

  } catch (error) {
    console.error("Error during analysis:", error);
    let errorMessage = "Zut alors! My deductive engines have sputtered. A most peculiar and unknown malfunction!";

    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes('api key not valid')) {
            errorMessage = "Mon Dieu! It seems my detective's license—the API key—is invalid. We must rectify this bureaucratic oversight!";
        } else if (lowerCaseMessage.includes('429')) {
            errorMessage = "Sacre bleu! We are receiving too many clues at once! My circuits must cool down. Please wait a moment before presenting more evidence.";
        } else if (lowerCaseMessage.includes('safety')) {
            errorMessage = "Non! This evidence is inadmissible. My analysis is immediately concluded. The content violates fundamental safety principles. This case is closed.";
        } else if (lowerCaseMessage.includes('network') || lowerCaseMessage.includes('failed to fetch')) {
            errorMessage = "It appears our secure line to the digital archives has been severed! Check your network connection, my dear Watson... I mean, user.";
        } else if (lowerCaseMessage.includes('json')) {
            errorMessage = "Mon Dieu! The model's response is a cryptic riddle, not the clear-cut JSON I expected. A most peculiar case!";
        }
    }
    throw new Error(errorMessage);
  }
};