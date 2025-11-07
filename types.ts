import type { ReactNode } from 'react';

export type AnalysisMode = 'quick' | 'deep';
export type ForensicMode = 'standard' | 'technical' | 'conceptual';
export type Theme = 'light' | 'dark';
export type InputType = 'text' | 'file';

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

export interface Scenario {
  title: string;
  description: string;
  icon: ReactNode;
  inputType: InputType;
  analysisMode: AnalysisMode;
  payload: {
    text?: string;
    files?: { name: string; imageBase64: string }[];
  };
}
