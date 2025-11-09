import type { AnalysisResult, AnalysisEvidence, AnalysisMode } from '../types';

/**
 * Generates a formatted plain text report from the analysis results.
 * This is the single source of truth for report formatting.
 * @param result The analysis result object.
 * @param evidence The evidence object.
 * @param timestamp The timestamp of the analysis.
 * @param forEmailBody If true, prepends a placeholder for user feedback.
 * @param analysisModeUsed The analysis mode ('quick' or 'deep') used.
 * @param modelUsed The specific Gemini model name used.
 * @returns A formatted string representing the forensic report.
 */
export const generateShareText = (
    result: AnalysisResult, 
    evidence: AnalysisEvidence | null, 
    timestamp: string | null,
    forEmailBody: boolean = false,
    analysisModeUsed: AnalysisMode | null,
    modelUsed: string | null
): string => {
    let evidenceText = '';
    if (evidence) {
        switch (evidence.type) {
            case 'file':
                try {
                    // FIX: Evidence content for files is a stringified JSON array. It needs to be parsed first.
                    const files: { name: string }[] = JSON.parse(evidence.content);
                    const fileNames = files.map(f => f.name).join(', ');
                    evidenceText = `EVIDENCE ANALYZED (FILES): ${fileNames}\n`;
                } catch (e) {
                    // Fallback for safety if parsing fails.
                    evidenceText = `EVIDENCE ANALYZED (FILES): [Could not parse file list]\n`;
                }
                break;
            case 'text':
                // Truncate long text for email body clarity
                const truncatedText = evidence.content.length > 500 ? evidence.content.substring(0, 500) + '...' : evidence.content;
                evidenceText = `EVIDENCE ANALYZED (TEXT):\n---\n${truncatedText}\n---\n\n`;
                break;
            // FIX: Removed 'url' case as it is not a valid InputType and was causing a type error.
        }
    }

    let text = '';
    if (forEmailBody) {
        text += `[--- PLEASE PROVIDE YOUR FEEDBACK OR SUGGESTION HERE ---]\n\n\n--- AUTOMATED CASE FILE ---\n`;
    } else {
        text += `--- FORENSIC REPORT ---\n`;
    }
    
    text += `Analysis by: GenAI Sleuther Vanguard\n`;
    if (analysisModeUsed && modelUsed) {
        const modeText = analysisModeUsed === 'deep' ? 'Deep Analysis' : 'Quick Scan';
        text += `Analysis Method: ${modeText} (${modelUsed})\n`;
    }
    if (timestamp) {
        text += `Date of Analysis: ${timestamp}\n`;
    }
    text += `\n`;
    
    if (evidenceText) {
        text += evidenceText + '\n';
    }

    text += `VERDICT: ${result.verdict}\n`;
    text += `AI PROBABILITY: ${Math.round(result.probability)}%\n\n`;
    text += `EXPLANATION:\n${result.explanation}\n\n`;
    
    if (result.highlights && result.highlights.length > 0) {
      text += 'KEY INDICATORS:\n';
      result.highlights.forEach(h => {
        text += `- "${h.text}": ${h.reason}\n`;
      });
      text += '\n';
    }

    text += 'Analysis performed by GenAI Sleuther Vanguard, powered by Google Gemini.';
    return text;
};