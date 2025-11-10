
import { describe, it, expect } from 'vitest';
import { sanitizeTextInput } from './textUtils';

describe('sanitizeTextInput', () => {
    it('should leave standard alphanumeric and punctuation text unchanged', () => {
        const text = 'Hello world! This is a test, with numbers 123 and symbols #@*.';
        expect(sanitizeTextInput(text)).toBe(text);
    });

    it('should normalize mixed newline characters (\\r\\n, \\r, \\n) to a single \\n', () => {
        const text = 'Line 1\r\nLine 2\rLine 3\nLine 4';
        const expected = 'Line 1\nLine 2\nLine 3\nLine 4';
        expect(sanitizeTextInput(text)).toBe(expected);
    });

    it('should remove non-printable ASCII control characters', () => {
        const text = 'Text with\x07a bell character and\x0Bvertical tab.';
        const expected = 'Text witha bell character andvertical tab.';
        expect(sanitizeTextInput(text)).toBe(expected);
    });

    it('should preserve common unicode letters, punctuation, and currency symbols', () => {
        const text = '你好世界 (Hánzì) - 123 - café - €_£#@*()';
        expect(sanitizeTextInput(text)).toBe(text);
    });

    it('should handle an empty string without errors', () => {
        expect(sanitizeTextInput('')).toBe('');
    });

    it('should handle a string containing only whitespace', () => {
        const text = ' \t\n ';
        const expected = ' \t\n '; // The regex preserves whitespace separators (\p{Z})
        expect(sanitizeTextInput(text)).toBe(expected);
    });
});
