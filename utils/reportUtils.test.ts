import { describe, it, expect } from 'vitest';
import { generateShareText } from './reportUtils';
import type { AnalysisResult, AnalysisEvidence } from '../types';

describe('generateShareText', () => {
    const mockResult: AnalysisResult = {
        probability: 88,
        verdict: 'Likely AI-Enhanced',
        explanation: 'The image shows signs of digital enhancement.',
        highlights: [
            { text: 'Unnatural Textures', reason: 'Common AI trait.' },
        ]
    };
    const mockTimestamp = '6 November 2025 at 10:00:00';

    it('should generate a standard report for file evidence', () => {
        const mockEvidence: AnalysisEvidence = {
            type: 'reference',
            fileRef: 'input_file',
            filename: 'cat.png'
        };
        const report = generateShareText(mockResult, mockEvidence, mockTimestamp, false, 'gemini-2.5-pro', 'forensic');

        expect(report).toContain('--- FORENSIC REPORT ---');
        expect(report).toContain(`Date of Analysis: ${mockTimestamp}`);
        expect(report).toContain('EVIDENCE ANALYSED (FILE): cat.png');
        expect(report).toContain('VERDICT: Likely AI-Enhanced');
        expect(report).toContain('AI PROBABILITY: 88%');
        expect(report).toContain('EXPLANATION:\nThe image shows signs of digital enhancement.');
        expect(report).toContain('KEY INDICATORS:');
        expect(report).toContain('- "Unnatural Textures": Common AI trait.');
    });

    it('should handle missing evidence and timestamp gracefully', () => {
        const report = generateShareText(mockResult, null, null, false, null, null);
        expect(report).not.toContain('Date of Analysis:');
        expect(report).not.toContain('EVIDENCE ANALYSED');
    });
    
    it('should handle results with no highlights', () => {
        const resultWithoutHighlights = { ...mockResult, highlights: [] };
        const mockEvidence: AnalysisEvidence = { 
            type: 'reference', 
            fileRef: 'input_file', 
            filename: 'test.jpg' 
        };
        const report = generateShareText(resultWithoutHighlights, mockEvidence, mockTimestamp, false, null, null);
        expect(report).not.toContain('KEY INDICATORS:');
    });

    it('should prepend a feedback placeholder when forEmailBody is true', () => {
        const mockEvidence: AnalysisEvidence = { 
            type: 'reference', 
            fileRef: 'input_file', 
            filename: 'test.jpg' 
        };
        const report = generateShareText(mockResult, mockEvidence, mockTimestamp, true, 'gemini-2.5-pro', 'forensic');
        expect(report).toContain('[--- PLEASE PROVIDE YOUR FEEDBACK OR SUGGESTION HERE ---]');
        expect(report).toContain('--- AUTOMATED CASE FILE ---');
    });
});