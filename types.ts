export type AnalysisMode = 'quick' | 'deep';
export type ForensicMode = 'standard' | 'technical' | 'conceptual';

export interface AnalysisResult {
  probability: number;
  verdict: string;
  explanation: string;
  highlights?: {
    text: string;
    reason: string;
  }[];
  isSecondOpinion?: boolean;
}