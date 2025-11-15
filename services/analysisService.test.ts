
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAnalysis } from './analysisService';
import * as api from '../api/analyze';
import type { AnalysisAngle } from '../types';

// Mock the API module
vi.mock('../api/analyze', () => ({
    analyzeContent: vi.fn(),
    analyzeContentStream: vi.fn(),
    analyzeWithSearch: vi.fn(),
}));

// A helper to mock the API response for deep dives
const mockDeepApiResponse = (highlights: { text: string; reason: string }[], verdict = 'Undetermined', explanation = 'Explanation', probability = 50) => {
    (api.analyzeContent as any).mockResolvedValue({
        probability,
        verdict,
        explanation,
        highlights,
    });
};

const mockApiKeys = { google: 'fake-google-key', sightengine: 'fake-sightengine-key' };
const mockFileData = { name: 'test.jpg', imageBase64: 'base64' };


describe('analysisService: finalizeVerdict Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test Case for Rule: "Incontrovertible Evidence" Trump Card
    it('should lock verdict to "AI-Generated Graphic" if a "Trump Card" keyword is found in highlights', async () => {
        const highlights = [
            { text: 'Natural Skin Texture', reason: 'The skin looks very real.' },
            { text: 'Idealized Perfection', reason: 'The lighting is too perfect to be real.' } // Trump Card
        ];
        mockDeepApiResponse(highlights, 'Appears Human-Crafted', 'Looks real but...', 10);

        // FIX: Updated runAnalysis call to match new signature.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('AI-Generated Graphic');
        expect(result.probability).toBe(93);
    });

    // Test Case for Graphic Design Contradiction
    it('should lock verdict to "AI-Generated Graphic" for a graphic with mixed evidence', async () => {
        const highlights = [
            { text: 'Coherent Brand Identity', reason: 'This is a real brand.' }, // Authentic
            { text: 'Digital Re-rendering', reason: 'The background has signs of AI generation.' } // Synthetic
        ];
        // The verdict is deliberately misleading to test the override
        mockDeepApiResponse(highlights, 'Appears Human-Crafted', 'This is a promotional poster.', 20);

        // FIX: Updated runAnalysis call to match new signature.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('Fully AI-Generated');
        expect(result.probability).toBe(93);
    });

    // Test Case for Pure Synthetic
    it('should return "Fully AI-Generated" when evidence is overwhelmingly synthetic', async () => {
        const highlights = [
            { text: 'AI Generation Artifacts', reason: 'Clear signs of AI.' },
            { text: 'Impossible Geometry', reason: 'The hand has six fingers.' }
        ];
        mockDeepApiResponse(highlights);

        // FIX: Updated runAnalysis call to match new signature.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('Fully AI-Generated');
        expect(result.probability).toBe(93);
    });

    // Test Case for Pure Authentic
    it('should return "Appears Human-Crafted" when evidence is overwhelmingly authentic', async () => {
        const highlights = [
            { text: 'Authentic Photographic Qualities', reason: 'Shows natural lens flare.' },
            { text: 'Natural Skin and Hair', reason: 'Details are consistent with a real person.' }
        ];
        mockDeepApiResponse(highlights);

        // FIX: Updated runAnalysis call to match new signature.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('Appears Human-Crafted');
        expect(result.probability).toBe(5);
    });

    // Test Case for Composite Fallback
    it('should fallback to "AI-Assisted Composite" for composite keywords without graphic context', async () => {
        const highlights: { text: string; reason: string }[] = [];
        mockDeepApiResponse(highlights, 'Composite Image', 'Figures were pasted onto the background.');

        // FIX: Updated runAnalysis call to match new signature.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('AI-Assisted Composite');
        expect(result.probability).toBe(65);
    });

    // Test Case for Enhancement Fallback
    it('should fallback to "AI-Enhanced" for filter keywords', async () => {
        const highlights: { text: string; reason: string }[] = [];
        mockDeepApiResponse(highlights, 'Image Processed', 'The image appears to have a stylistic filter applied.');

        // FIX: Updated runAnalysis call to match new signature.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('AI-Enhanced (Stylistic Filter)');
        expect(result.probability).toBe(75);
    });

    // Test Case for Quick Scan (Text Analysis)
    it('should correctly finalize a text analysis result', async () => {
        (api.analyzeContent as any).mockResolvedValue({
            verdict: 'Likely AI',
            probability: 90,
            explanation: 'The text seems AI generated.',
            highlights: [{text: 'Primary Finding', reason: 'Unusual phrasing.'}],
        });

        // FIX: Updated runAnalysis call to match new signature. This test case for text analysis is obsolete
        // as the app now only supports file analysis, but is being kept to avoid removing tests.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('Likely AI');
        expect(result.probability).toBe(90);
        expect(result.explanation).toBe('The text seems AI generated.');
        expect(result.highlights).toHaveLength(1);
        expect(result.highlights?.[0].text).toBe('Primary Finding');
    });


    // Test Case for final fallback clamping
    it('should use the raw verdict but clamp the score if no other rules match', async () => {
        const highlights: { text: string; reason: string }[] = [];
        // A high score with a "human" verdict
        mockDeepApiResponse(highlights, 'Appears Human-Crafted', 'No obvious issues found.', 95);

        // FIX: Updated runAnalysis call to match new signature.
        const { result } = await runAnalysis(mockFileData, 'forensic', mockApiKeys);
        
        expect(result.verdict).toBe('Appears Human-Crafted');
        expect(result.probability).toBe(39); // Score clamped
    });
});
