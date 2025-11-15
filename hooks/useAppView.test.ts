
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

    it('should return LOADING for a standard loading state', () => {
        mockUseResultState({});
        mockUseUIState({ isLoading: true });
        const view = renderHook(useAppView);
        expect(view).toBe('LOADING');
    });
    
    it('should return RESULT when an analysisResult is present and the app is not loading', () => {
        mockUseResultState({
            analysisResult: { probability: 90, verdict: 'AI', explanation: '...' }
        });
        mockUseUIState({});
        const view = renderHook(useAppView);
        expect(view).toBe('RESULT');
    });

    // FIX: Changed test case from "text view" to "file view" as text analysis is no longer supported.
    it('should return LOADING for a deep-dive streaming file view (initial analysis)', () => {
         mockUseResultState({
            // FIX: Changed evidence type to 'file' to match current type definitions.
            analysisEvidence: { type: 'file', content: 'abc' },
            analysisResult: { probability: 0, verdict: '...', explanation: '' } // The placeholder result exists.
        });
        mockUseUIState({
            isLoading: true,
            isStreaming: true,
        });
        const view = renderHook(useAppView);
        // The hook should show the main loader, not the result panel.
        expect(view).toBe('LOADING');
    });

    it('should return LOADING for a deep-dive streaming file view', () => {
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
