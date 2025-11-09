import { describe, it, expect } from 'vitest';
// FIX: Export `resultReducer` and `initialState` from the context file to make them importable for testing.
import { resultReducer, initialState } from './ResultStateContext';
import * as actions from './actions';
import type { AnalysisEvidence, AnalysisResult, AnalysisMode } from '../types';

describe('resultReducer', () => {

    it('should return the initial state', () => {
        // @ts-ignore - testing default case with an empty action
        expect(resultReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle START_ANALYSIS for deep mode (streaming)', () => {
        // FIX: Explicitly cast `analysisMode` to `AnalysisMode` to prevent TypeScript from widening the type to a generic `string`, which causes a type mismatch with the reducer's action payload.
        const payload = {
            evidence: { type: 'text', content: 'test' } as AnalysisEvidence,
            analysisMode: 'deep' as AnalysisMode,
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(initialState, { type: actions.START_ANALYSIS, payload });

        expect(state.isLoading).toBe(true);
        expect(state.isStreaming).toBe(true);
        expect(state.analysisEvidence).toEqual(payload.evidence);
        expect(state.analysisModeUsed).toBe('deep');
        expect(state.analysisResult).not.toBeNull();
        expect(state.analysisResult?.verdict).toBe('Deducing...');
    });

    it('should handle START_ANALYSIS for quick mode (not streaming)', () => {
        // FIX: Explicitly cast `analysisMode` to `AnalysisMode` to prevent TypeScript from widening the type to a generic `string`, which causes a type mismatch with the reducer's action payload.
        const payload = {
            evidence: { type: 'text', content: 'test' } as AnalysisEvidence,
            analysisMode: 'quick' as AnalysisMode,
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(initialState, { type: actions.START_ANALYSIS, payload });

        expect(state.isLoading).toBe(true);
        expect(state.isStreaming).toBe(false);
        expect(state.analysisResult).toBeNull();
    });

    it('should handle START_REANALYSIS', () => {
        const previousState = {
            ...initialState,
            analysisResult: { probability: 50, verdict: 'Mixed', explanation: 'Old' }
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(previousState, { type: actions.START_REANALYSIS });

        expect(state.isLoading).toBe(true);
        expect(state.isReanalyzing).toBe(true);
        expect(state.isStreaming).toBe(true);
        expect(state.analysisResult?.isSecondOpinion).toBe(true);
        expect(state.analysisResult?.explanation).toBe(''); // Explanation cleared
    });

    it('should handle STREAM_ANALYSIS_UPDATE', () => {
        const startState = {
            ...initialState,
            analysisResult: { probability: 0, verdict: 'Deducing...', explanation: 'Initial' }
        };
        const action = { type: actions.STREAM_ANALYSIS_UPDATE, payload: { explanation: 'Initial chunk' } };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(startState, { type: actions.STREAM_ANALYSIS_UPDATE, payload: { explanation: 'Initial chunk' } });
        expect(state.analysisResult?.explanation).toBe('Initial chunk');
    });

    it('should handle ANALYSIS_SUCCESS', () => {
        const payload = {
            result: { probability: 90, verdict: 'AI', explanation: 'Done' } as AnalysisResult,
            // FIX: Added the required `modelName` property to the payload.
            modelName: 'gemini-2.5-pro',
            isSecondOpinion: true
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer({ ...initialState, isLoading: true }, { type: actions.ANALYSIS_SUCCESS, payload });

        expect(state.isLoading).toBe(false);
        expect(state.isStreaming).toBe(false);
        expect(state.isReanalyzing).toBe(false);
        expect(state.analysisResult?.probability).toBe(90);
        expect(state.analysisResult?.isSecondOpinion).toBe(true);
        expect(state.analysisTimestamp).not.toBeNull();
        expect(state.modelUsed).toBe('gemini-2.5-pro');
    });

    it('should handle ANALYSIS_ERROR', () => {
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer({ ...initialState, isLoading: true }, { type: actions.ANALYSIS_ERROR, payload: 'API Error' });
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('API Error');
    });
    
    it('should handle NEW_ANALYSIS', () => {
        const currentState = {
            ...initialState,
            isLoading: false,
            error: 'Some error',
            analysisResult: { probability: 1, verdict: 'V', explanation: 'E' }
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(currentState, { type: actions.NEW_ANALYSIS });
        expect(state).toEqual(initialState);
    });

    it('should handle CLEAR_ERROR', () => {
        const currentState = { ...initialState, error: 'Some error' };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(currentState, { type: actions.CLEAR_ERROR });
        expect(state.error).toBeNull();
    });
});
