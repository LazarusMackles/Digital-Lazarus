import { describe, it, expect } from 'vitest';
// FIX: Export `inputReducer` and `initialState` from the context file to make them importable for testing.
import { inputReducer, initialState } from './InputStateContext';
import * as actions from './actions';
// FIX: Imported AnalysisAngle to use in tests.
import type { Scenario, InputType, AnalysisAngle } from '../types';

describe('inputReducer', () => {
    it('should return the initial state', () => {
        // @ts-ignore - testing default case with an empty action
        expect(inputReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle SET_TEXT_CONTENT', () => {
        const payload = 'New text content';
        const expectedState = { ...initialState, textContent: payload, fileData: null };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        expect(inputReducer(initialState, { type: actions.SET_TEXT_CONTENT, payload })).toEqual(expectedState);
    });

    it('should handle SET_FILE_DATA', () => {
        const payload = { name: 'test.png', imageBase64: 'base64str' };
        const expectedState = { ...initialState, fileData: payload, textContent: '' };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        expect(inputReducer(initialState, { type: actions.SET_FILE_DATA, payload })).toEqual(expectedState);
    });

    it('should handle SET_ACTIVE_INPUT', () => {
        const payload: InputType = 'text';
        const expectedState = { ...initialState, activeInput: payload };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        expect(inputReducer(initialState, { type: actions.SET_ACTIVE_INPUT, payload })).toEqual(expectedState);
    });

    // FIX: Removed test for deprecated SET_ANALYSIS_MODE action.

    // FIX: Added test for the current SET_ANALYSIS_ANGLE action.
    it('should handle SET_ANALYSIS_ANGLE', () => {
        const payload: AnalysisAngle = 'provenance';
        const expectedState = { ...initialState, analysisAngle: payload };
        expect(inputReducer(initialState, { type: actions.SET_ANALYSIS_ANGLE, payload })).toEqual(expectedState);
    });

    // FIX: Removed test for deprecated SET_FORENSIC_MODE action.

    it('should handle CLEAR_INPUTS', () => {
        // FIX: Explicitly cast `activeInput` to `InputType` to prevent TypeScript from widening the type to a generic `string`, which causes a type mismatch with the reducer's state parameter.
        const currentState = {
            ...initialState,
            textContent: 'some text',
            fileData: { name: 'file.jpg', imageBase64: 'base64' },
            activeInput: 'text' as InputType,
        };
        const expectedState = {
            ...initialState,
            textContent: '',
            fileData: null,
            activeInput: 'file', // Should reset to the new default
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        expect(inputReducer(currentState, { type: actions.CLEAR_INPUTS })).toEqual(expectedState);
    });

    it('should handle LOAD_SCENARIO for text', () => {
        const scenario: Scenario = {
            title: 'Test Scenario',
            description: '',
            icon: null,
            inputType: 'text',
            // FIX: Removed obsolete 'analysisMode' property from Scenario object.
            payload: { text: 'Scenario text' }
        };
        const expectedState = {
            ...initialState,
            activeInput: 'text',
            textContent: 'Scenario text',
            fileData: null,
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        expect(inputReducer(initialState, { type: actions.LOAD_SCENARIO, payload: scenario })).toEqual(expectedState);
    });

     it('should handle LOAD_SCENARIO for file', () => {
        const file = { name: 'scenario.png', imageBase64: 'base64' };
        const scenario: Scenario = {
            title: 'Test Scenario',
            description: '',
            icon: null,
            inputType: 'file',
            payload: { file }
        };
        const expectedState = {
            ...initialState,
            activeInput: 'file',
            textContent: '',
            fileData: file,
        };
        // FIX: Inlined action object to prevent TypeScript from widening the `type` property to a generic `string`.
        expect(inputReducer(initialState, { type: actions.LOAD_SCENARIO, payload: scenario })).toEqual(expectedState);
    });
});