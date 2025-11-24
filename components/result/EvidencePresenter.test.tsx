import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EvidencePresenter } from './EvidencePresenter';
import { InputStateProvider, InputStateContext, initialState } from '../../context/InputStateContext';
import type { AnalysisEvidence } from '../../types';

// Mock EvidenceImage to avoid canvas/blob issues in JSDOM
vi.mock('../ui', () => ({
    EvidenceImage: ({ base64Src, alt }: any) => <img src={base64Src} alt={alt} data-testid="evidence-img" />,
    ImageLightbox: () => <div>Lightbox</div>
}));

describe('EvidencePresenter', () => {
    it('renders file evidence correctly', () => {
        const mockEvidence: AnalysisEvidence = {
            type: 'reference',
            fileRef: 'input_file',
            filename: 'suspect.jpg'
        };

        const mockInputState = {
            ...initialState,
            fileData: { name: 'suspect.jpg', imageBase64: 'data:image/jpeg;base64,123' }
        };

        render(
            <InputStateContext.Provider value={{ state: mockInputState, dispatch: vi.fn() }}>
                <EvidencePresenter 
                    evidence={mockEvidence} 
                    probability={90} 
                    analysisAngleUsed="forensic" 
                />
            </InputStateContext.Provider>
        );

        expect(screen.getByText('suspect.jpg')).toBeDefined();
        const img = screen.getByTestId('evidence-img');
        expect(img.getAttribute('src')).toBe('data:image/jpeg;base64,123');
    });

    it('renders appropriate border color for AI high probability', () => {
        const mockEvidence: AnalysisEvidence = {
            type: 'reference',
            fileRef: 'input_file',
            filename: 'ai.jpg'
        };

        const mockInputState = {
            ...initialState,
            fileData: { name: 'ai.jpg', imageBase64: 'data:image/jpeg;base64,123' }
        };

        const { container } = render(
            <InputStateContext.Provider value={{ state: mockInputState, dispatch: vi.fn() }}>
                 <EvidencePresenter 
                    evidence={mockEvidence} 
                    probability={95} 
                    analysisAngleUsed="forensic" 
                />
            </InputStateContext.Provider>
        );

        // Check for red border class (rose-500)
        expect(container.innerHTML).toContain('border-rose-500');
    });

    it('renders appropriate border color for Provenance mode', () => {
        const mockEvidence: AnalysisEvidence = {
            type: 'reference',
            fileRef: 'input_file',
            filename: 'search.jpg'
        };
        
        const mockInputState = {
            ...initialState,
            fileData: { name: 'search.jpg', imageBase64: 'data:image/jpeg;base64,123' }
        };

        const { container } = render(
            <InputStateContext.Provider value={{ state: mockInputState, dispatch: vi.fn() }}>
                 <EvidencePresenter 
                    evidence={mockEvidence} 
                    probability={0} 
                    analysisAngleUsed="provenance" 
                />
            </InputStateContext.Provider>
        );

        // Check for cyan border class
        expect(container.innerHTML).toContain('border-cyan-500');
    });
});