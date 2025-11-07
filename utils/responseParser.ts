import type { AnalysisResult } from '../types';

/**
 * Parses a structured plain-text string from the AI into a formal AnalysisResult object.
 * This is robust to missing fields and variations in the text.
 * @param text The raw text response from the API.
 * @returns An AnalysisResult object.
 */
export const parseAnalysisResponse = (text: string): AnalysisResult => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    const result: AnalysisResult = {
        probability: 50, // Default value
        verdict: 'Undetermined', // Default value
        explanation: 'The analysis result was incomplete or in an unexpected format.', // Default value
        highlights: []
    };

    const highlights: { text: string; reason: string }[] = [];

    for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        switch (key.trim().toUpperCase()) {
            case 'PROBABILITY':
                const probability = parseInt(value, 10);
                if (!isNaN(probability)) {
                    result.probability = Math.max(0, Math.min(100, probability));
                }
                break;
            case 'VERDICT':
                result.verdict = value;
                break;
            case 'EXPLANATION':
                result.explanation = value;
                break;
            default:
                // Handle HIGHLIGHT lines
                if (key.trim().toUpperCase().startsWith('HIGHLIGHT')) {
                    const [highlightText, reason] = value.split(' - ');
                    if (highlightText && reason) {
                        highlights.push({ text: highlightText.trim(), reason: reason.trim() });
                    }
                }
                break;
        }
    }

    if (highlights.length > 0) {
        result.highlights = highlights;
    }
    
    // A final check to ensure critical fields have been updated from their defaults.
    if (result.verdict === 'Undetermined' && result.explanation.startsWith('The analysis result was incomplete')) {
       // The response was likely unstructured. Use the whole text as the explanation.
       console.warn("Could not parse structured response, using raw text as explanation.");
       result.explanation = text;
    }


    return result;
};
