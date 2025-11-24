import type { ReactNode } from 'react';

export type AnalysisAngle = 'forensic' | 'provenance' | 'hybrid';
export type Theme = 'light' | 'dark';

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
  type: 'reference';
  fileRef: 'input_file';
  filename: string;
}

export interface Scenario {
  title: string;
  description: string;
  icon: ReactNode;
  payload: {
    file: { name: string; imageBase64: string };
  };
}