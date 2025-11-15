import { describe, it, expect } from 'vitest';
import { inputReducer, initialState } from './InputStateContext';
import * as actions from './actions';
import type { Scenario, AnalysisAngle } from '../types';

describe('inputReducer', () => {
    it('should return the initial state', () => {
        // @ts-ignore - testing default case with an empty action
        expect(inputReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle SET_FILE_DATA', () => {
        const payload = { name: 'test.png', imageBase64: 'base64str' };
        const expectedState = { ...initialState, fileData: payload };
        expect(inputReducer(initialState, { type: actions.SET_FILE_DATA, payload })).toEqual(expectedState);
    });

    it('should handle SET_ANALYSIS_ANGLE', () => {
        const payload: AnalysisAngle = 'provenance';
        const expectedState = { ...initialState, analysisAngle: payload };
        expect(inputReducer(initialState, { type: actions.SET_ANALYSIS_ANGLE, payload })).toEqual(expectedState);
    });

    it('should handle CLEAR_INPUTS', () => {
        const currentState = {
            ...initialState,
            fileData: { name: 'file.jpg', imageBase64: 'base64' },
            analysisAngle: 'provenance' as AnalysisAngle,
        };
        expect(inputReducer(currentState, { type: actions.CLEAR_INPUTS })).toEqual(initialState);
    });

    it('should handle LOAD_SCENARIO for file', () => {
        const file = { name: 'scenario.png', imageBase64: 'base64' };
        const scenario: Scenario = {
            title: 'Test Scenario',
            description: '',
            icon: null,
            payload: { file }
        };
        const expectedState = {
            ...initialState,
            fileData: file,
        };
        expect(inputReducer(initialState, { type: actions.LOAD_SCENARIO, payload: scenario })).toEqual(expectedState);
    });
});