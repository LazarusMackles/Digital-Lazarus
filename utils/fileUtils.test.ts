// FIX: This file contained placeholder text causing a syntax error. Replaced with a valid test suite for file utilities, including mocks for browser APIs.
import { describe, it, expect, vi } from 'vitest';
import { base64ToBlobUrl } from './fileUtils';

// Mock browser-specific APIs for Node environment
// FIX: Replaced `global` with `globalThis` for better cross-environment compatibility.
// Used `any` casts to bypass TypeScript errors that arise from a test environment
// that may not have Node.js types (`Buffer`, etc.) available by default.
(globalThis as any).atob = (b64: string) => (globalThis as any).Buffer.from(b64, 'base64').toString('binary');
(globalThis as any).URL.createObjectURL = vi.fn().mockImplementation(() => 'blob:mock_url');
(globalThis as any).Blob = class MockBlob {
    constructor(public parts: any[], public options: any) {}
} as any;

describe('fileUtils', () => {
    it('base64ToBlobUrl should convert a valid data URL', () => {
        const dataUrl = 'data:image/png;base64,aGVsbG8='; // "hello"
        const result = base64ToBlobUrl(dataUrl);
        expect(result).toBe('blob:mock_url');
    });

    it('base64ToBlobUrl should throw on invalid data URL', () => {
        const invalidUrl = 'data:image/png;base64';
        expect(() => base64ToBlobUrl(invalidUrl)).toThrow('Invalid base64 string provided for Blob conversion.');
    });
});
