import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as geminiService from './services/geminiService';

// Mock dependencies
vi.mock('./services/geminiService');
vi.mock('./services/sightengineService', () => ({
    analyzeWithSightengine: vi.fn().mockResolvedValue({ ai_generated: 0.1 }),
}));

// Mock IconSprite to prevent rendering issues in tests
vi.mock('./App', async (importOriginal) => {
    const actual = await importOriginal() as typeof import('./App');
    return {
        ...actual,
        IconSprite: () => <div data-testid="icon-sprite" />,
    };
});

describe('App Integration Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock localStorage
        const localStorageMock = (function() {
            let store: Record<string, string> = {};
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => {
                    store[key] = value.toString();
                },
                clear: () => {
                    store = {};
                },
                removeItem: (key: string) => {
                    delete store[key];
                }
            };
        })();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
        });

        // Set a mock API key in localStorage to bypass the auth check for this test flow
        window.localStorage.setItem('sleuther_google_api_key', 'test_key');
        
        // Mock scroll methods
        window.scrollTo = vi.fn();
    });

    it('renders the main application structure', () => {
        render(<App />);
        expect(screen.getByText('GenAI Sleuther Vanguard')).toBeDefined();
        // Should show input form by default
        expect(screen.getByText('Drag & drop an image here,')).toBeDefined();
    });

    it('shows authentication warning if no key is present', () => {
        window.localStorage.removeItem('sleuther_google_api_key');
        render(<App />);
        expect(screen.getByText('Authentication Required')).toBeDefined();
    });

    it('handles file upload and analysis flow', async () => {
        const mockAnalyzeContent = vi.mocked(geminiService.analyzeContent);
        mockAnalyzeContent.mockResolvedValue({
            probability: 10,
            verdict: 'Appears Human-Crafted',
            explanation: 'Test explanation',
            highlights: []
        });

        const { container } = render(<App />);

        // 1. Simulate File Upload
        const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
        const input = container.querySelector('input[type="file"]');
        expect(input).not.toBeNull();
        
        if (input) {
            fireEvent.change(input, { target: { files: [file] } });
        }

        // Wait for preview to appear (indicates file processed)
        await waitFor(() => {
            expect(screen.getByText('test.png')).toBeDefined();
        });

        // 2. Click Deduction Button
        const button = screen.getByText('Begin Deduction');
        expect(button).not.toBeDisabled();
        fireEvent.click(button);

        // 3. Verify Loading State
        await waitFor(() => {
            expect(screen.getByText(/Scanning pixels/i)).toBeDefined();
        });

        // 4. Verify Result State
        await waitFor(() => {
            expect(screen.getByText('Appears Human-Crafted')).toBeDefined();
            expect(screen.getByText('10%')).toBeDefined();
        });
    });
});