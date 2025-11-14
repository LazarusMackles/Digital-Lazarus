import { describe, it, expect } from 'vitest';
// FIX: Export `resultReducer` and `initialState` from the context file to make them importable for testing.
import { resultReducer, initialState } from './ResultStateContext';
import * as actions from './actions';
// FIX: Replaced deprecated AnalysisMode with AnalysisAngle.
import type { AnalysisEvidence, AnalysisResult, AnalysisAngle } from '../types';

describe('resultReducer', () => {

    it('should return the initial state', () => {
        // @ts-ignore - testing default case with an empty action
        expect(resultReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle START_ANALYSIS for text input (streaming)', () => {
        // FIX: Replaced `analysisMode` with `analysisAngle` in the payload.
        const payload = {
            evidence: { type: 'text', content: 'test' } as AnalysisEvidence,
            analysisAngle: 'forensic' as AnalysisAngle,
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(initialState, { type: actions.START_ANALYSIS, payload });

        expect(state.analysisEvidence).toEqual(payload.evidence);
        // FIX: Checked `analysisAngleUsed` instead of the removed `analysisModeUsed`.
        expect(state.analysisAngleUsed).toBe('forensic');
        expect(state.analysisResult).not.toBeNull();
        expect(state.analysisResult?.verdict).toBe('Deducing ...');
    });

    it('should handle START_ANALYSIS for file input (not streaming)', () => {
        // FIX: Changed evidence type to 'file' to test non-streaming path.
        // FIX: Replaced `analysisMode` with `analysisAngle`.
        const payload = {
            evidence: { type: 'file', content: 'test' } as AnalysisEvidence,
            analysisAngle: 'forensic' as AnalysisAngle,
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(initialState, { type: actions.START_ANALYSIS, payload });

        expect(state.analysisEvidence).toEqual(payload.evidence);
        // FIX: Checked `analysisAngleUsed` instead of the removed `analysisModeUsed`.
        expect(state.analysisAngleUsed).toBe('forensic');
        expect(state.analysisResult).toBeNull();
    });

    it('should handle START_REANALYSIS', () => {
        const previousState = {
            ...initialState,
            analysisResult: { probability: 50, verdict: 'Mixed', explanation: 'Old' } as AnalysisResult
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(previousState, { type: actions.START_REANALYSIS });

        expect(state.analysisResult?.isSecondOpinion).toBe(true);
        expect(state.analysisResult?.explanation).toBe(''); // Explanation cleared
    });

    it('should handle STREAM_ANALYSIS_UPDATE', () => {
        const startState = {
            ...initialState,
            analysisResult: { probability: 0, verdict: 'Deducing...', explanation: 'Initial' } as AnalysisResult
        };
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
        const state = resultReducer(initialState, { type: actions.ANALYSIS_SUCCESS, payload });

        expect(state.analysisResult?.probability).toBe(90);
        expect(state.analysisResult?.isSecondOpinion).toBe(true);
        expect(state.analysisTimestamp).not.toBeNull();
        expect(state.modelUsed).toBe('gemini-2.5-pro');
    });
    
    it('should handle NEW_ANALYSIS', () => {
        const currentState = {
            ...initialState,
            analysisResult: { probability: 1, verdict: 'V', explanation: 'E' } as AnalysisResult
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        const state = resultReducer(currentState, { type: actions.NEW_ANALYSIS });
        expect(state).toEqual(initialState);
    });
});