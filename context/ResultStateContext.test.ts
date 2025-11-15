import { describe, it, expect } from 'vitest';
import { resultReducer, initialState } from './ResultStateContext';
import * as actions from './actions';
import type { AnalysisEvidence, AnalysisResult, AnalysisAngle } from '../types';

describe('resultReducer', () => {

    it('should return the initial state', () => {
        // @ts-ignore - testing default case with an empty action
        expect(resultReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle START_ANALYSIS for provenance (streaming)', () => {
        const payload = {
            evidence: { type: 'file', content: 'test' } as AnalysisEvidence,
            analysisAngle: 'provenance' as AnalysisAngle,
        };
        const state = resultReducer(initialState, { type: actions.START_ANALYSIS, payload });

        expect(state.analysisEvidence).toEqual(payload.evidence);
        expect(state.analysisAngleUsed).toBe('provenance');
        expect(state.analysisResult).not.toBeNull();
        expect(state.analysisResult?.verdict).toBe('Deducing ...');
    });

    it('should handle START_ANALYSIS for forensic input (not streaming)', () => {
        const payload = {
            evidence: { type: 'file', content: 'test' } as AnalysisEvidence,
            analysisAngle: 'forensic' as AnalysisAngle,
        };
        const state = resultReducer(initialState, { type: actions.START_ANALYSIS, payload });

        expect(state.analysisEvidence).toEqual(payload.evidence);
        expect(state.analysisAngleUsed).toBe('forensic');
        expect(state.analysisResult).toBeNull();
    });

    it('should handle START_REANALYSIS', () => {
        const previousState = {
            ...initialState,
            analysisResult: { probability: 50, verdict: 'Mixed', explanation: 'Old' } as AnalysisResult
        };
        const state = resultReducer(previousState, { type: actions.START_REANALYSIS });

        expect(state.analysisResult?.isSecondOpinion).toBe(true);
        expect(state.analysisResult?.explanation).toBe(''); // Explanation cleared
    });

    it('should handle STREAM_ANALYSIS_UPDATE', () => {
        const startState = {
            ...initialState,
            analysisResult: { probability: 0, verdict: 'Deducing...', explanation: 'Initial' } as AnalysisResult
        };
        const state = resultReducer(startState, { type: actions.STREAM_ANALYSIS_UPDATE, payload: { explanation: 'Initial chunk' } });
        expect(state.analysisResult?.explanation).toBe('Initial chunk');
    });

    it('should handle ANALYSIS_SUCCESS', () => {
        const payload = {
            result: { probability: 90, verdict: 'AI', explanation: 'Done' } as AnalysisResult,
            modelName: 'gemini-2.5-pro',
            isSecondOpinion: true
        };
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
        const state = resultReducer(currentState, { type: actions.NEW_ANALYSIS });
        expect(state).toEqual(initialState);
    });
});