export type AnalysisMode = 'quick' | 'deep';

export interface AnalysisResult {
  probability: number;
  verdict: string;
  explanation: string;
  highlights?: {
    text: string;
    reason: string;
  }[];
}