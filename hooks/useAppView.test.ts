import { describe, it, expect, vi } from 'vitest';
import { useAppView } from './useAppView';
import * as ResultStateContext from '../context/ResultStateContext';
import type { ResultState } from '../context/ResultStateContext';
// FIX: Import UI state context and its initial state to properly mock both hooks used by useAppView.
import * as UIStateContext from '../context/UIStateContext';
import type { UIState } from '../context/UIStateContext';

// A minimal test harness for React hooks.
const renderHook = <T,>(hook: () => T): T => {
    return hook();
};

// A helper to mock the state provided by the useResultState context hook.
const mockUseResultState = (state: Partial<ResultState>) => {
    vi.spyOn(ResultStateContext, 'useResultState').mockReturnValue({
        state: { ...ResultStateContext.initialState, ...state },
        dispatch: vi.fn(),
    });
};

// FIX: Added a helper to mock the state provided by the useUIState context hook.
const mockUseUIState = (state: Partial<UIState>) => {
    vi.spyOn(UIStateContext, 'useUIState').mockReturnValue({
        state: { ...UIStateContext.initialState, ...state },
        dispatch: vi.fn(),
    });
};


describe('useAppView', () => {
    it('should return INPUT by default when there is no result or loading state', () => {
        mockUseResultState({});
        mockUseUIState({});
        const view = renderHook(useAppView);
        expect(view).toBe('INPUT');
    });

    it('should return LOADING for a standard (non-streaming text) loading state', () => {
        mockUseResultState({});
        // FIX: Moved isLoading to the correct UI state mock.
        mockUseUIState({ isLoading: true });
        const view = renderHook(useAppView);
        expect(view).toBe('LOADING');
    });

    it('should return LOADING for a re-analysis, even if it is a streaming text view', () => {
        // FIX: Separated state properties into their respective context mocks.
        mockUseResultState({
            analysisEvidence: { type: 'text', content: 'abc' },
            analysisResult: { probability: 0, verdict: '...', explanation: '' }
        });
        mockUseUIState({
            isLoading: true,
            isReanalyzing: true,
            isStreaming: true,
        });
        const view = renderHook(useAppView);
        // The hook prioritizes the main loading view for re-analysis.
        expect(view).toBe('LOADING');
    });

    it('should return RESULT when an analysisResult is present and the app is not in a main loading state', () => {
        mockUseResultState({
            analysisResult: { probability: 90, verdict: 'AI', explanation: '...' }
        });
        mockUseUIState({});
        const view = renderHook(useAppView);
        expect(view).toBe('RESULT');
    });

    it('should return RESULT for a deep-dive streaming text view', () => {
        // FIX: Separated state properties into their respective context mocks.
         mockUseResultState({
            analysisEvidence: { type: 'text', content: 'abc' },
            analysisResult: { probability: 0, verdict: '...', explanation: '' } // The placeholder result exists.
        });
        mockUseUIState({
            isLoading: true,
            isStreaming: true,
            isReanalyzing: false,
        });
        const view = renderHook(useAppView);
        // The hook logic correctly identifies this as a streaming text view and shows the result panel, not the main loader.
        expect(view).toBe('RESULT');
    });

    it('should return LOADING for a deep-dive streaming file view', () => {
        // FIX: Separated state properties into their respective context mocks.
         mockUseResultState({
            analysisEvidence: { type: 'file', content: '...' },
            analysisResult: { probability: 0, verdict: '...', explanation: '' }
        });
         mockUseUIState({
            isLoading: true,
            isStreaming: true,
        });
        const view = renderHook(useAppView);
        // The streaming text exception does not apply to files, so the main loader is shown.
        expect(view).toBe('LOADING');
    });
});