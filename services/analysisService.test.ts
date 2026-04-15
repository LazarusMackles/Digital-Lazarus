import { describe, it, expect } from 'vitest';
import { 
    buildPrompt, 
    finalizeForensicVerdict 
} from './analysisService';
import type { AnalysisAngle, AnalysisResult } from '../types';

describe('analysisService', () => {

    // --- buildPrompt Tests ---
    describe('buildPrompt', () => {
        const fileData = { name: 'evidence.jpg' };

        it('should generate a correct prompt for forensic analysis', () => {
            const prompt = buildPrompt(fileData, 'forensic', false);
            expect(prompt).toContain('forensic image analyst');
            expect(prompt).toContain('STANDARD ANALYSIS');
        });

        it('should generate a correct prompt for hybrid analysis with a score', () => {
            const prompt = buildPrompt(fileData, 'hybrid', false, 85);
            expect(prompt).toContain('Advanced pixel-level analysis has confirmed this image is AI-GENERATED');
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

        it('should use Hive score and align verdict when provided', () => {
            const result = finalizeForensicVerdict(rawResult, 30);
            expect(result.probability).toBe(30);
            expect(result.verdict).toBe('Appears Human-Crafted');
        });
        
        it('should align verdict for high Hive score', () => {
             const result = finalizeForensicVerdict(rawResult, 85);
             expect(result.probability).toBe(85);
             expect(result.verdict).toBe('Fully AI-Generated');
        });

        it('should align verdict for mid Hive score', () => {
             const result = finalizeForensicVerdict(rawResult, 60);
             expect(result.probability).toBe(60);
             expect(result.verdict).toBe('Likely AI-Enhanced');
        });

        it('should clamp probability based on verdict when no external score is given', () => {
            const humanResult = finalizeForensicVerdict({ ...rawResult, verdict: 'Appears Human-Crafted', probability: 88 });
            expect(humanResult.probability).toBe(35);
            
            const aiResult = finalizeForensicVerdict({ ...rawResult, verdict: 'Fully AI-Generated', probability: 30 });
            expect(aiResult.probability).toBe(85);
        });
    });

});
