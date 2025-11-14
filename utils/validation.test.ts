import { describe, it, expect } from 'vitest';
import { isInputReadyForAnalysis } from './validation';
import type { InputType } from '../types';

describe('isInputReadyForAnalysis', () => {

    // Test suite for 'text' input type
    describe("when activeInput is 'text'", () => {
        const activeInput: InputType = 'text';
        // FIX: The function expects `fileData` to be an object or null, not an array. For text input tests, it should be null.
        const fileData: { name: string } | null = null;

        it('should return true for valid text content without URLs', () => {
            const textContent = 'This is a sample text for analysis.';
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData)).toBe(true);
        });

        it('should return false for empty or whitespace-only text content', () => {
            expect(isInputReadyForAnalysis(activeInput, '', fileData)).toBe(false);
            expect(isInputReadyForAnalysis(activeInput, '   ', fileData)).toBe(false);
        });

        it('should return true for text content containing a URL', () => {
            const textWithUrl = 'Check out this site: https://example.com';
            expect(isInputReadyForAnalysis(activeInput, textWithUrl, fileData)).toBe(true);
        });
        
        it('should return true for text content with URL and other text', () => {
             const textWithUrl = 'Some text http://google.com and more text.';
             expect(isInputReadyForAnalysis(activeInput, textWithUrl, fileData)).toBe(true);
        });
    });

    // Test suite for 'file' input type
    describe("when activeInput is 'file'", () => {
        const activeInput: InputType = 'file';
        const textContent = '';

        it('should return true when fileData is not empty', () => {
            // FIX: The `fileData` argument should be an object, not an array of objects.
            const fileData = { name: 'image1.png' };
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData)).toBe(true);
        });

        it('should return false when fileData is empty', () => {
            // FIX: For an empty file input, `fileData` should be null, not an empty array.
            const fileData: { name: string } | null = null;
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData)).toBe(false);
        });
    });

    // Test default case
     describe("with an unknown activeInput", () => {
        it('should return false', () => {
            // Cast to any to bypass TypeScript type safety for the test
            const activeInput = 'invalid_type' as any;
            const textContent = 'some text';
            // FIX: The `fileData` argument should be an object, not an array of objects.
            const fileData = { name: 'some_file.jpg' };
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData)).toBe(false);
        });
    });
});
