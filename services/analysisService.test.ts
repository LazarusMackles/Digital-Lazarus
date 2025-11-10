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

    it('should use FLASH model for text analysis', async () => {
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

    it('should use QUICK_IMAGE model for quick file analysis and compress image', async () => {
        (api.analyzeContent as any).mockResolvedValue({ confidence_score: 50, quick_verdict: 'OK', artifact_1: 'a1', artifact_2: 'a2' });
        const fileData = [{ name: 'test.jpg', imageBase64: 'base64' }];

        await runAnalysis('file', '', fileData, 'quick', 'standard');
        
        expect(imageCompression.aggressivelyCompressImageForAnalysis).toHaveBeenCalledWith('base64');
        expect(api.analyzeContent).toHaveBeenCalledWith(
            expect.any(String),
            [{...fileData[0], imageBase64: 'base64-compressed'}],
            'quick',
            MODELS.QUICK_IMAGE,
            '' // sanitizedText
        );
    });

    it('should use PRO model for deep file analysis and NOT compress image', async () => {
        (api.analyzeContentStream as any).mockResolvedValue({ probability: 90, verdict: 'AI', explanation: 'Deep analysis' });
        const fileData = [{ name: 'test.jpg', imageBase64: 'base64' }];
        const streamHandler = vi.fn();

        await runAnalysis('file', '', fileData, 'deep', 'technical', streamHandler);
        
        expect(imageCompression.aggressivelyCompressImageForAnalysis).not.toHaveBeenCalled();
        expect(api.analyzeContentStream).toHaveBeenCalledWith(
            expect.stringContaining('Focus your analysis STRICTLY on technical artifacts'),
            fileData,
            MODELS.PRO,
            expect.any(Function),
            '' // sanitizedText
        );
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

        expect(result).toEqual({
            probability: 75,
            verdict: 'Likely AI',
            explanation: "My initial scan suggests the verdict based on the following key indicators. For a more detailed analysis, a 'Deep Dive' is recommended.",
            highlights: [
                { text: 'Primary Finding', reason: 'Too perfect' },
                { text: 'Secondary Finding', reason: 'Unnatural symmetry' }
            ]
        });
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

        expect(result).toEqual({ ...mockApiResponse, highlights: mockApiResponse.highlights || [] });
    });
});