import type { ReactNode } from 'react';

export type AnalysisAngle = 'forensic' | 'provenance';
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
  groundingMetadata?: any;
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
  payload: {
    text?: string;
    files?: { name: string; imageBase64: string }[];
  };
}
