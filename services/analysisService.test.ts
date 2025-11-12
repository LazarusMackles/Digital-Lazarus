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
            MODELS.PRO,
            ''
        );
    });

    it('should use PRO model for deep file analysis and call analyzeContent (not stream)', async () => {
        (api.analyzeContent as any).mockResolvedValue({ probability: 90, verdict: 'AI', explanation: 'Deep analysis' });
        const fileData = [{ name: 'test.jpg', imageBase64: 'base64' }];

        await runAnalysis('file', '', fileData, 'deep', 'technical');
        
        expect(imageCompression.aggressivelyCompressImageForAnalysis).toHaveBeenCalledWith('base64');
        expect(api.analyzeContent).toHaveBeenCalledWith(
            expect.stringContaining('Technical analysis ONLY'),
            [{ ...fileData[0], imageBase64: 'base64-compressed' }],
            'deep',
            MODELS.PRO,
            ''
        );
        expect(api.analyzeContentStream).not.toHaveBeenCalled();
    });

    it('should call analyzeContentStream for deep analysis', async () => {
        (api.analyzeContentStream as any).mockResolvedValue({ probability: 90, verdict: 'AI', explanation: 'Deep analysis' });
        const streamHandler = vi.fn();

        await runAnalysis('text', 'deep text', [], 'deep', 'standard', streamHandler);

        expect(api.analyzeContentStream).toHaveBeenCalled();
        expect(api.analyzeContent).not.toHaveBeenCalled();
    });
    
    // --- New Tests for Verdict Finalization ---

    it('should force an "AI-Enhanced" verdict and a 75% score when enhancement keywords are present', async () => {
        const mockApiResponse = {
            probability: 25, // Deliberately wrong score
            verdict: 'This looks like a photograph that has been heavily filtered.', // Keyword: "filtered"
            explanation: 'The skin is too smooth.',
            highlights: []
        };
        (api.analyzeContent as any).mockResolvedValue(mockApiResponse);

        const { result } = await runAnalysis('file', '', [{ name: 'test.jpg', imageBase64: 'base64' }], 'deep', 'standard');

        expect(result.verdict).toBe('AI-Enhanced (Stylistic Filter)');
        expect(result.probability).toBe(75); // Score is corrected
    });

    it('should clamp a "Human-Crafted" verdict with an illogical score down to 39%', async () => {
        const mockApiResponse = {
            probability: 90, // Illogical high score
            verdict: 'Appears Human-Crafted',
            explanation: 'Looks like a real photo.',
            highlights: []
        };
        (api.analyzeContent as any).mockResolvedValue(mockApiResponse);

        const { result } = await runAnalysis('file', '', [{ name: 'test.jpg', imageBase64: 'base64' }], 'deep', 'standard');

        expect(result.verdict).toBe('Appears Human-Crafted');
        expect(result.probability).toBe(39); // Score is clamped
    });
    
    it('should clamp a "Fully AI-Generated" verdict with an illogical score up to 80%', async () => {
        const mockApiResponse = {
            probability: 50, // Illogical low score
            verdict: 'This is fully AI-generated.',
            explanation: 'The hands are wrong.',
            highlights: []
        };
        (api.analyzeContent as any).mockResolvedValue(mockApiResponse);

        const { result } = await runAnalysis('file', '', [{ name: 'test.jpg', imageBase64: 'base64' }], 'deep', 'standard');

        expect(result.verdict).toBe('This is fully AI-generated.');
        expect(result.probability).toBe(80); // Score is clamped
    });
});