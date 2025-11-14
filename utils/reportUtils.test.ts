import { describe, it, expect } from 'vitest';
import { generateShareText } from './reportUtils';
import type { AnalysisResult, AnalysisEvidence } from '../types';

describe('generateShareText', () => {
    const mockResult: AnalysisResult = {
        probability: 88,
        verdict: 'Likely AI-Enhanced',
        explanation: 'The text exhibits a high degree of lexical diversity.',
        highlights: [
            { text: 'lexical diversity', reason: 'Common AI trait.' },
            { text: 'syntactic complexity', reason: 'Another AI indicator.' }
        ]
    };
    const mockTimestamp = '6 November 2025 at 10:00:00';

    it('should generate a standard report for text evidence', () => {
        const mockEvidence: AnalysisEvidence = {
            type: 'text',
            content: 'This is the text that was analysed.'
        };
        // FIX: Removed the extra 'deep' argument to match the function's 5-parameter signature.
        const report = generateShareText(mockResult, mockEvidence, mockTimestamp, false, 'gemini-2.5-pro');

        expect(report).toContain('--- FORENSIC REPORT ---');
        expect(report).toContain('Analysis by: GenAI Sleuther Vanguard');
        expect(report).toContain(`Date of Analysis: ${mockTimestamp}`);
        expect(report).toContain('EVIDENCE ANALYSED (TEXT):');
        expect(report).toContain(mockEvidence.content);
        expect(report).toContain('VERDICT: Likely AI-Enhanced');
        expect(report).toContain('AI PROBABILITY: 88%');
        expect(report).toContain('EXPLANATION:\nThe text exhibits a high degree of lexical diversity.');
        expect(report).toContain('KEY INDICATORS:');
        expect(report).toContain('- "lexical diversity": Common AI trait.');
        expect(report).toContain('- "syntactic complexity": Another AI indicator.');
        expect(report).toContain('Analysis performed by GenAI Sleuther Vanguard, powered by Google Gemini.');
    });
    
    it('should truncate long text evidence', () => {
        const longText = 'a'.repeat(600);
        const mockEvidence: AnalysisEvidence = {
            type: 'text',
            content: longText,
        };
        // FIX: Removed the extra 'quick' argument to match the function's 5-parameter signature.
        const report = generateShareText(mockResult, mockEvidence, mockTimestamp, false, 'gemini-2.5-flash');
        const expectedTruncatedText = 'a'.repeat(500) + ' ...';

        expect(report).toContain(expectedTruncatedText);
        expect(report).not.toContain(longText);
    });

    it('should generate a report for file evidence', () => {
        const mockEvidence: AnalysisEvidence = {
            type: 'file',
            content: JSON.stringify({ name: 'cat.png' })
        };
        // FIX: Removed the extra 'deep' argument to match the function's 5-parameter signature.
        const report = generateShareText(mockResult, mockEvidence, mockTimestamp, false, 'gemini-2.5-pro');
        expect(report).toContain('EVIDENCE ANALYSED (FILE): cat.png');
    });

    // FIX: Removed test case for deprecated 'url' evidence type which was causing a type error.

    it('should handle missing evidence and timestamp gracefully', () => {
        // FIX: Removed the extra null argument to match the function's 5-parameter signature.
        const report = generateShareText(mockResult, null, null, false, null);
        expect(report).not.toContain('Date of Analysis:');
        expect(report).not.toContain('EVIDENCE ANALYSED');
    });
    
    it('should handle results with no highlights', () => {
        const resultWithoutHighlights = { ...mockResult, highlights: [] };
        const mockEvidence: AnalysisEvidence = { type: 'text', content: 'text' };
        // FIX: Removed the extra null argument to match the function's 5-parameter signature.
        const report = generateShareText(resultWithoutHighlights, mockEvidence, mockTimestamp, false, null);
        expect(report).not.toContain('KEY INDICATORS:');
    });

    it('should prepend a feedback placeholder when forEmailBody is true', () => {
        const mockEvidence: AnalysisEvidence = { type: 'text', content: 'text' };
        // FIX: Removed the extra 'deep' argument to match the function's 5-parameter signature.
        const report = generateShareText(mockResult, mockEvidence, mockTimestamp, true, 'gemini-2.5-pro');
        expect(report).toContain('[--- PLEASE PROVIDE YOUR FEEDBACK OR SUGGESTION HERE ---]');
        expect(report).toContain('--- AUTOMATED CASE FILE ---');
        expect(report).not.toContain('--- FORENSIC REPORT ---');
    });
});