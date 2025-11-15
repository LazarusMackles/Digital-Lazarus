import { describe, it, expect } from 'vitest';
import { isInputReadyForAnalysis } from './validation';

describe('isInputReadyForAnalysis', () => {
    it('should return true when fileData is present', () => {
        const fileData = { name: 'image1.png' };
        expect(isInputReadyForAnalysis(fileData)).toBe(true);
    });

    it('should return false when fileData is null', () => {
        const fileData: { name: string } | null = null;
        expect(isInputReadyForAnalysis(fileData)).toBe(false);
    });
});