
import type { AnalysisResult, AnalysisMode, ForensicMode, InputType } from '../types';

// --- analyzeContent function ---
interface AnalyzeContentParams {
  text: string | null;
  images: string[] | null;
  analysisMode: AnalysisMode;
  forensicMode: ForensicMode;
  systemInstructionPreamble?: string;
  activeInput: InputType;
}

const executeAnalysis = async (payload: any): Promise<Response> => {
  return fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const analyzeContent = async ({
  text,
  images,
  analysisMode,
  forensicMode,
  systemInstructionPreamble,
  activeInput,
}: AnalyzeContentParams): Promise<AnalysisResult> => {
  
  try {
      // The payload is now a simple object containing only the data.
      // All complex logic (prompts, schemas, model selection) is handled server-side.
      const payload = {
        text,
        images,
        analysisMode,
        forensicMode,
        systemInstructionPreamble,
        activeInput,
      };
      
      // Dynamic timeout: 120s for Deep Dive, 60s for Quick Scan.
      const timeoutDuration = analysisMode === 'deep' ? 120000 : 60000;

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          // Pass analysisMode in the error for contextual messaging.
          const timeoutError = new Error("Client-side request timeout.");
          timeoutError.name = 'TimeoutError';
          (timeoutError as any).analysisMode = analysisMode;
          reject(timeoutError);
        }, timeoutDuration);
      });
      
      const response = await Promise.race([
        executeAnalysis(payload),
        timeoutPromise
      ]);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred with the analysis proxy.');
      }

      const result = await response.json();
      return result as AnalysisResult;

  } catch(e: any) {
      console.error("API proxy call failed:", e);
      let errorMessage = "The deductive engine encountered a critical fault. Please try again.";
      
      if (e.name === 'TimeoutError') {
        const mode = (e as any).analysisMode || 'deep'; // Default to deep if mode is not passed
        if (mode === 'deep') {
          errorMessage = "The analysis timed out. This can happen with complex requests on the 'Deep Dive' setting. Please try a 'Quick Scan' or simplify your input.";
        } else {
          errorMessage = "The analysis timed out, which is unusual for a 'Quick Scan'. The deductive engine may be busy. Please try your request again in a moment.";
        }
      } else if (e.message.toLowerCase().includes('quota')) {
          errorMessage = "My circuits are overheating due to high demand! Please wait a moment before trying again (quota exceeded).";
      }
      throw new Error(errorMessage);
  }
};
