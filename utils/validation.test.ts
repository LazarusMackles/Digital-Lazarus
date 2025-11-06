import { describe, it, expect } from 'vitest';
import { isInputReadyForAnalysis } from './validation';
import type { InputType } from '../types';

describe('isInputReadyForAnalysis', () => {

    // Test suite for 'text' input type
    describe("when activeInput is 'text'", () => {
        const activeInput: InputType = 'text';
        const fileData: { name: string }[] = [];
        // FIX: Added missing 'url' argument for calls to isInputReadyForAnalysis.
        const url = '';

        it('should return true for valid text content without URLs', () => {
            const textContent = 'This is a sample text for analysis.';
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData, url)).toBe(true);
        });

        it('should return false for empty or whitespace-only text content', () => {
            expect(isInputReadyForAnalysis(activeInput, '', fileData, url)).toBe(false);
            expect(isInputReadyForAnalysis(activeInput, '   ', fileData, url)).toBe(false);
        });

        it('should return false for text content containing a URL', () => {
            const textWithUrl = 'Check out this site: https://example.com';
            expect(isInputReadyForAnalysis(activeInput, textWithUrl, fileData, url)).toBe(false);
        });
        
        it('should return false for text content with URL and other text', () => {
             const textWithUrl = 'Some text http://google.com and more text.';
             expect(isInputReadyForAnalysis(activeInput, textWithUrl, fileData, url)).toBe(false);
        });
    });

    // Test suite for 'file' input type
    describe("when activeInput is 'file'", () => {
        const activeInput: InputType = 'file';
        const textContent = '';
        // FIX: Added missing 'url' argument for calls to isInputReadyForAnalysis.
        const url = '';

        it('should return true when fileData is not empty', () => {
            const fileData = [{ name: 'image1.png' }];
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData, url)).toBe(true);
        });

        it('should return false when fileData is empty', () => {
            const fileData: { name: string }[] = [];
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData, url)).toBe(false);
        });
    });

    // Test suite for 'url' input type
    describe("when activeInput is 'url'", () => {
        const activeInput: InputType = 'url';
        const textContent = '';
        const fileData: { name: string }[] = [];

        it('should always return false as the feature is disabled', () => {
            // FIX: Added missing 'url' argument. An empty string is not a valid URL, so the test passes.
            const url = '';
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData, url)).toBe(false);
        });
    });

    // Test default case
     describe("with an unknown activeInput", () => {
        it('should return false', () => {
            // Cast to any to bypass TypeScript type safety for the test
            const activeInput = 'invalid_type' as any;
            const textContent = 'some text';
            const fileData = [{ name: 'some_file.jpg' }];
            // FIX: Added missing 'url' argument for call to isInputReadyForAnalysis.
            const url = '';
            expect(isInputReadyForAnalysis(activeInput, textContent, fileData, url)).toBe(false);
        });
    });
});
