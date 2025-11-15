import type { AnalysisResult, AnalysisEvidence, AnalysisAngle } from '../types';

export const generateShareText = (
    result: AnalysisResult, 
    evidence: AnalysisEvidence | null, 
    timestamp: string | null,
    forEmailBody: boolean = false,
    modelUsed: string | null,
    analysisAngleUsed: AnalysisAngle | null
): string => {
    let evidenceText = '';
    if (evidence) {
        try {
            const file: { name: string } = JSON.parse(evidence.content);
            evidenceText = `EVIDENCE ANALYSED (FILE): ${file.name}\n`;
        } catch (e) {
            evidenceText = `EVIDENCE ANALYSED (FILE): [Could not parse file data]\n`;
        }
    }

    let text = '';
    if (forEmailBody) {
        text += `[--- PLEASE PROVIDE YOUR FEEDBACK OR SUGGESTION HERE ---]\n\n\n--- AUTOMATED CASE FILE ---\n`;
    } else {
        text += `--- FORENSIC REPORT ---\n`;
    }
    
    text += `Analysis by: GenAI Sleuther Vanguard\n`;
    if (modelUsed) {
        let analysisType = 'Forensic Analysis';
        if (analysisAngleUsed === 'provenance') analysisType = 'Provenance Dossier';
        if (analysisAngleUsed === 'hybrid') analysisType = 'Hybrid Analysis';
        text += `Analysis Method: ${analysisType} (${modelUsed})\n`;
    }
    if (timestamp) {
        text += `Date of Analysis: ${timestamp}\n`;
    }
    text += `\n`;
    
    if (evidenceText) {
        text += evidenceText + '\n';
    }

    text += `VERDICT: ${result.verdict}\n`;
    if (result.probability > 0) { 
        text += `AI PROBABILITY: ${Math.round(result.probability)}%\n\n`;
    }
    text += `EXPLANATION:\n${result.explanation}\n\n`;
    
    if (result.highlights && result.highlights.length > 0) {
      text += 'KEY INDICATORS:\n';
      result.highlights.forEach(h => {
        text += `- "${h.text}": ${h.reason}\n`;
      });
      text += '\n';
    }

    if (result.groundingMetadata && result.groundingMetadata.groundingChunks) {
        text += 'SOURCES FOUND:\n';
        result.groundingMetadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web) {
                text += `- ${chunk.web.title}: ${chunk.web.uri}\n`;
            }
        });
        text += '\n';
    }

    text += 'Analysis performed by GenAI Sleuther Vanguard, powered by Google Gemini.';
    return text;
};