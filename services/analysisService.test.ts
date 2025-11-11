import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAnalysis } from './analysisService';
import * as api from '../api/analyze';
import * as imageCompression from '../utils/imageCompression';
import { MODELS } from '../utils/constants';

// Mock the API module
vi.mock('../api/analyze', () => ({
    analyzeContent: vi.fn(),
    analyzeContentStream: vi.fn(),
}));

// Mock the image compression module
vi.mock('../utils/imageCompression', () => ({
    aggressivelyCompressImageForAnalysis: vi.fn(str => Promise.resolve(`${str}-compressed`)),
}));


describe('analysisService: runAnalysis', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use FLASH model for quick text analysis', async () => {
        (api.analyzeContent as any).mockResolvedValue({ confidence_score: 50, quick_verdict: 'OK', artifact_1: 'a1', artifact_2: 'a2' });

        await runAnalysis('text', 'some text', [], 'quick', 'standard');

        expect(api.analyzeContent).toHaveBeenCalledWith(
            expect.any(String), // prompt
            [], // files
            'quick',
            MODELS.FLASH,
            'some text' // sanitizedText
        );
    });

    it('should use PRO model for quick file analysis and compress image', async () => {
        (api.analyzeContent as any).mockResolvedValue({ confidence_score: 50, quick_verdict: 'OK', artifact_1: 'a1', artifact_2: 'a2' });
        const fileData = [{ name: 'test.jpg', imageBase64: 'base64' }];

        await runAnalysis('file', '', fileData, 'quick', 'standard');
        
        expect(imageCompression.aggressivelyCompressImageForAnalysis).toHaveBeenCalledWith('base64');
        expect(api.analyzeContent).toHaveBeenCalledWith(
            expect.any(String),
            [{...fileData[0], imageBase64: 'base64-compressed'}],
            'quick',
            MODELS.PRO, // Should now use PRO model
            '' // sanitizedText
        );
    });

    it('should use PRO model for deep file analysis and call analyzeContent (not stream)', async () => {
        (api.analyzeContent as any).mockResolvedValue({ probability: 90, verdict: 'AI', explanation: 'Deep analysis' });
        const fileData = [{ name: 'test.jpg', imageBase64: 'base64' }];

        await runAnalysis('file', '', fileData, 'deep', 'technical');
        
        expect(imageCompression.aggressivelyCompressImageForAnalysis).toHaveBeenCalledWith('base64');
        expect(api.analyzeContent).toHaveBeenCalledWith(
            expect.stringContaining('Focus your analysis STRICTLY on technical artifacts'),
            [{ ...fileData[0], imageBase64: 'base64-compressed' }], // compressed data
            'deep',
            MODELS.PRO,
            '' // sanitizedText
        );
        // Assert that streaming is NOT used for files
        expect(api.analyzeContentStream).not.toHaveBeenCalled();
    });

    it('should call analyzeContentStream for deep analysis', async () => {
        (api.analyzeContentStream as any).mockResolvedValue({ probability: 90, verdict: 'AI', explanation: 'Deep analysis' });
        const streamHandler = vi.fn();

        await runAnalysis('text', 'deep text', [], 'deep', 'standard', streamHandler);

        expect(api.analyzeContentStream).toHaveBeenCalled();
        expect(api.analyzeContent).not.toHaveBeenCalled();
    });
    
    it('should correctly normalize quick scan results', async () => {
        const mockApiResponse = {
            confidence_score: 75,
            quick_verdict: 'Likely AI',
            artifact_1: 'Too perfect',
            artifact_2: 'Unnatural symmetry'
        };
        (api.analyzeContent as any).mockResolvedValue(mockApiResponse);

        const { result } = await runAnalysis('text', 'quick text', [], 'quick', 'standard');

        // The probability is harmonized based on the verdict
        expect(result.verdict).toBe('Likely AI');
        expect(result.probability).toBeGreaterThanOrEqual(91);
        expect(result.explanation).toContain("My initial scan suggests");
    });

    it('should correctly normalize deep scan results', async () => {
        const mockApiResponse = {
            probability: 88,
            verdict: 'AI-Generated',
            explanation: 'The structure is highly complex.',
            highlights: [{ text: 'Complex sentence', reason: 'AI trait' }]
        };
        (api.analyzeContentStream as any).mockResolvedValue(mockApiResponse);

        const { result } = await runAnalysis('text', 'deep text', [], 'deep', 'standard', vi.fn());

        // The probability is harmonized based on the verdict
        expect(result.verdict).toBe('AI-Generated');
        expect(result.probability).toBeGreaterThanOrEqual(91);
        expect(result.explanation).toBe(mockApiResponse.explanation);
    });
});