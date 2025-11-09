import { describe, it, expect } from 'vitest';
// FIX: Export `resultReducer` and `initialState` from the context file to make them importable for testing.
import { resultReducer, initialState } from './ResultStateContext';
import * as actions from './actions';
import type { AnalysisEvidence, AnalysisResult } from '../types';

describe('resultReducer', () => {

    it('should return the initial state', () => {
        // @ts-ignore - testing default case with an empty action
        expect(resultReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle START_ANALYSIS for deep mode (streaming)', () => {
        const payload = {
            evidence: { type: 'text', content: 'test' } as AnalysisEvidence,
            analysisMode: 'deep',
        };
        const action = { type: actions.START_ANALYSIS, payload };
        const state = resultReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.isStreaming).toBe(true);
        expect(state.analysisEvidence).toEqual(payload.evidence);
        expect(state.analysisModeUsed).toBe('deep');
        expect(state.analysisResult).not.toBeNull();
        expect(state.analysisResult?.verdict).toBe('Deducing...');
    });

    it('should handle START_ANALYSIS for quick mode (not streaming)', () => {
        const payload = {
            evidence: { type: 'text', content: 'test' } as AnalysisEvidence,
            analysisMode: 'quick',
        };
        const action = { type: actions.START_ANALYSIS, payload };
        const state = resultReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.isStreaming).toBe(false);
        expect(state.analysisResult).toBeNull();
    });

    it('should handle START_REANALYSIS', () => {
        const previousState = {
            ...initialState,
            analysisResult: { probability: 50, verdict: 'Mixed', explanation: 'Old' }
        };
        const action = { type: actions.START_REANALYSIS };
        // @ts-ignore
        const state = resultReducer(previousState, action);

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
        // @ts-ignore
        const state = resultReducer(startState, action);
        expect(state.analysisResult?.explanation).toBe('Initial chunk');
    });

    it('should handle ANALYSIS_SUCCESS', () => {
        const payload = {
            result: { probability: 90, verdict: 'AI', explanation: 'Done' } as AnalysisResult,
            isSecondOpinion: true
        };
        const action = { type: actions.ANALYSIS_SUCCESS, payload };
        // @ts-ignore
        const state = resultReducer({ ...initialState, isLoading: true }, action);

        expect(state.isLoading).toBe(false);
        expect(state.isStreaming).toBe(false);
        expect(state.isReanalyzing).toBe(false);
        expect(state.analysisResult?.probability).toBe(90);
        expect(state.analysisResult?.isSecondOpinion).toBe(true);
        expect(state.analysisTimestamp).not.toBeNull();
    });

    it('should handle ANALYSIS_ERROR', () => {
        const action = { type: actions.ANALYSIS_ERROR, payload: 'API Error' };
        // @ts-ignore
        const state = resultReducer({ ...initialState, isLoading: true }, action);
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
        const action = { type: actions.NEW_ANALYSIS };
        // @ts-ignore
        const state = resultReducer(currentState, action);
        expect(state).toEqual(initialState);
    });

    it('should handle CLEAR_ERROR', () => {
        const currentState = { ...initialState, error: 'Some error' };
        const action = { type: actions.CLEAR_ERROR };
        // @ts-ignore
        const state = resultReducer(currentState, action);
        expect(state.error).toBeNull();
    });
});