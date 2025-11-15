

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

    it('should return LOADING when in the analyzing_pixels stage', () => {
        mockUseResultState({});
        mockUseUIState({ analysisStage: 'analyzing_pixels' });
        const view = renderHook(useAppView);
        expect(view).toBe('LOADING');
    });
    
    it('should return LOADING when in the analyzing_context stage', () => {
        mockUseResultState({});
        mockUseUIState({ analysisStage: 'analyzing_context' });
        const view = renderHook(useAppView);
        expect(view).toBe('LOADING');
    });

    it('should return RESULT when an analysisResult is present and the app is not loading', () => {
        mockUseResultState({
            analysisResult: { probability: 90, verdict: 'AI', explanation: '...' }
        });
        mockUseUIState({ analysisStage: 'complete' }); // or 'idle'
        const view = renderHook(useAppView);
        expect(view).toBe('RESULT');
    });
});