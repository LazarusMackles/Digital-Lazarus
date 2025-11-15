import { describe, it, expect } from 'vitest';
import { 
    buildPrompt, 
    finalizeForensicVerdict, 
    finalizeProvenanceVerdict 
} from './analysisService';
import type { AnalysisAngle, AnalysisResult } from '../types';

describe('analysisService', () => {

    // --- buildPrompt Tests ---
    describe('buildPrompt', () => {
        const fileData = { name: 'evidence.jpg' };

        it('should generate a correct prompt for forensic analysis', () => {
            const prompt = buildPrompt(fileData, 'forensic', false);
            expect(prompt).toContain('forensic analysis tool');
            expect(prompt).toContain('STANDARD ANALYSIS');
            expect(prompt).not.toContain('Sightengine');
        });

        it('should generate a correct prompt for provenance analysis', () => {
            const prompt = buildPrompt(fileData, 'provenance', false);
            expect(prompt).toContain('digital content investigator');
            expect(prompt).toContain('investigate the provided image "evidence.jpg"');
        });

        it('should generate a correct prompt for hybrid analysis with a score', () => {
            const prompt = buildPrompt(fileData, 'hybrid', false, 85);
            expect(prompt).toContain('Sightengine has returned a 85% probability');
        });
        
        it('should include the reanalysis directive when isReanalysis is true', () => {
            const prompt = buildPrompt(fileData, 'forensic', true);
            expect(prompt).toContain('PRIORITY DIRECTIVE: SECOND OPINION');
        });
    });


    // --- finalizeForensicVerdict Tests ---
    describe('finalizeForensicVerdict', () => {
        const rawResult = {
            probability: 95,
            verdict: 'Fully AI-Generated',
            explanation: 'Obvious signs of AI.',
            highlights: [{ text: 'Glow', reason: 'Too perfect' }]
        };

        it('should use Sightengine score and align verdict when provided', () => {
            const result = finalizeForensicVerdict(rawResult, 30);
            expect(result.probability).toBe(30);
            expect(result.verdict).toBe('Appears Human-Crafted');
        });
        
        it('should align verdict for high Sightengine score', () => {
             const result = finalizeForensicVerdict(rawResult, 85);
             expect(result.probability).toBe(85);
             expect(result.verdict).toBe('Fully AI-Generated');
        });

        it('should align verdict for mid Sightengine score', () => {
             const result = finalizeForensicVerdict(rawResult, 60);
             expect(result.probability).toBe(60);
             expect(result.verdict).toBe('Likely AI-Enhanced');
        });

        it('should clamp probability based on verdict when no external score is given', () => {
            const humanResult = finalizeForensicVerdict({ ...rawResult, verdict: 'Appears Human-Crafted', probability: 88 });
            expect(humanResult.probability).toBe(39);
            
            const aiResult = finalizeForensicVerdict({ ...rawResult, verdict: 'Fully AI-Generated', probability: 30 });
            expect(aiResult.probability).toBe(80);

            const mixedResult = finalizeForensicVerdict({ ...rawResult, verdict: 'Composite: Human & AI', probability: 90 });
            expect(mixedResult.probability).toBe(79);
        });
    });

    // --- finalizeProvenanceVerdict Tests ---
    describe('finalizeProvenanceVerdict', () => {
        it('should return "No Online History Found" if no grounding chunks exist', () => {
            const response = { text: 'Could not find anything.' };
            const result = finalizeProvenanceVerdict(response);
            expect(result.verdict).toBe('No Online History Found');
        });

        it('should return "Authentic Photograph" for positive signals', () => {
            const response = {
                text: 'This is a verified real photo.',
                candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: 'test.com' } }] } }]
            };
            const result = finalizeProvenanceVerdict(response);
            expect(result.verdict).toBe('Authentic Photograph');
        });

        it('should return "AI-Generated" for negative signals', () => {
             const response = {
                text: 'Fact checkers have debunked this as AI-generated.',
                candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: 'test.com' } }] } }]
            };
            const result = finalizeProvenanceVerdict(response);
            expect(result.verdict).toBe('AI-Generated');
        });
        
        it('should always return a probability of 0', () => {
            const response = { text: 'Some text' };
            const result = finalizeProvenanceVerdict(response);
            expect(result.probability).toBe(0);
        });
    });

});
