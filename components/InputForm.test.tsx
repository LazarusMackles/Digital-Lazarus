// vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputForm } from './InputForm';
import { InputStateProvider } from '../context/InputStateContext';
import { UIStateProvider } from '../context/UIStateContext';
import * as AnalysisWorkflowHook from '../hooks/useAnalysisWorkflow';
// FIX: Corrected typo in import path from useApiKey to useApiKeys.
import * as ApiKeyHook from '../hooks/useApiKeys';

// --- Mocks ---
const mockPerformAnalysis = vi.fn();
const mockSelectApiKey = vi.fn();

vi.mock('../hooks/useAnalysisWorkflow', () => ({
  useAnalysisWorkflow: vi.fn(),
}));
vi.mock('../hooks/useApiKeys', () => ({
  useApiKeys: vi.fn(),
}));

// A test harness that renders the component with all necessary providers
const renderComponent = () => {
    return render(
        <InputStateProvider>
            <UIStateProvider>
                <InputForm />
            </UIStateProvider>
        </InputStateProvider>
    );
};

describe('InputForm Component Interaction with React Testing Library', () => {

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations for each test
        (AnalysisWorkflowHook.useAnalysisWorkflow as Mock).mockReturnValue({
            performAnalysis: mockPerformAnalysis,
            handleClearInputs: vi.fn(),
        });
    });

    it('should call performAnalysis when "Begin Deduction" is clicked with valid input and API key', () => {
        (ApiKeyHook.useApiKeys as Mock).mockReturnValue({
            hasApiKey: true,
            isChecking: false,
            selectApiKey: mockSelectApiKey,
        });

        renderComponent();
        
        const submitButton = screen.getByRole('button', { name: /Begin Deduction/i });
        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        expect(mockPerformAnalysis).toHaveBeenCalledTimes(1);
    });

    it('should show the "Select API Key" button when no API key is present', () => {
        (ApiKeyHook.useApiKeys as Mock).mockReturnValue({
            hasApiKey: false,
            isChecking: false,
            selectApiKey: mockSelectApiKey,
        });

        renderComponent();
        
        const selectKeyButton = screen.getByRole('button', { name: /Select API Key to Begin/i });
        expect(selectKeyButton).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Begin Deduction/i })).not.toBeInTheDocument();

        fireEvent.click(selectKeyButton);
        expect(mockSelectApiKey).toHaveBeenCalledTimes(1);
    });

     it('should show a loading spinner while checking for the API key', () => {
        (ApiKeyHook.useApiKeys as Mock).mockReturnValue({
            hasApiKey: false,
            isChecking: true, // Key check is in progress
            selectApiKey: mockSelectApiKey,
        });

        renderComponent();
        
        // Check for the spinner icon by its href, as it has no text
        const spinner = document.querySelector('svg use[href="#icon-spinner"]');
        expect(spinner).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
