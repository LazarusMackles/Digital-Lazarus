export type AnalysisMode = 'quick' | 'deep';
export type ForensicMode = 'standard' | 'technical' | 'conceptual';
export type Theme = 'light' | 'dark';
export type InputType = 'text' | 'file' | 'url';

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

export interface AnalysisEvidence {
  type: InputType;
  content: string;
}
