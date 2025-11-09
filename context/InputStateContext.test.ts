import { describe, it, expect } from 'vitest';
// FIX: Export `inputReducer` and `initialState` from the context file to make them importable for testing.
import { inputReducer, initialState } from './InputStateContext';
import * as actions from './actions';
import type { Scenario } from '../types';

describe('inputReducer', () => {
    it('should return the initial state', () => {
        // @ts-ignore - testing default case with an empty action
        expect(inputReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle SET_TEXT_CONTENT', () => {
        const payload = 'New text content';
        const action = { type: actions.SET_TEXT_CONTENT, payload };
        const expectedState = { ...initialState, textContent: payload, fileData: [] };
        expect(inputReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle SET_FILE_DATA', () => {
        const payload = [{ name: 'test.png', imageBase64: 'base64str' }];
        const action = { type: actions.SET_FILE_DATA, payload };
        // @ts-ignore
        const expectedState = { ...initialState, fileData: payload, textContent: '' };
        expect(inputReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle SET_ACTIVE_INPUT', () => {
        const payload = 'text';
        const action = { type: actions.SET_ACTIVE_INPUT, payload };
        const expectedState = { ...initialState, activeInput: payload };
        // @ts-ignore
        expect(inputReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle SET_ANALYSIS_MODE', () => {
        const payload = 'deep';
        const action = { type: actions.SET_ANALYSIS_MODE, payload };
        const expectedState = { ...initialState, analysisMode: payload };
        // @ts-ignore
        expect(inputReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle SET_FORENSIC_MODE', () => {
        const payload = 'technical';
        const action = { type: actions.SET_FORENSIC_MODE, payload };
        const expectedState = { ...initialState, forensicMode: payload };
        // @ts-ignore
        expect(inputReducer(initialState, action)).toEqual(expectedState);

    });

    it('should handle CLEAR_INPUTS', () => {
        const currentState = {
            ...initialState,
            textContent: 'some text',
            fileData: [{ name: 'file.jpg' }],
            activeInput: 'text',
        };
        const action = { type: actions.CLEAR_INPUTS };
        const expectedState = {
            ...initialState,
            textContent: '',
            fileData: [],
            activeInput: 'file', // Should reset to the default
        };
        // @ts-ignore
        expect(inputReducer(currentState, action)).toEqual(expectedState);
    });

    it('should handle LOAD_SCENARIO for text', () => {
        const scenario: Scenario = {
            title: 'Test Scenario',
            description: '',
            icon: null,
            inputType: 'text',
            analysisMode: 'deep',
            payload: { text: 'Scenario text' }
        };
        const action = { type: actions.LOAD_SCENARIO, payload: scenario };
        const expectedState = {
            ...initialState,
            activeInput: 'text',
            analysisMode: 'deep',
            textContent: 'Scenario text',
            fileData: [],
        };
        expect(inputReducer(initialState, action)).toEqual(expectedState);
    });

     it('should handle LOAD_SCENARIO for file', () => {
        const files = [{ name: 'scenario.png', imageBase64: 'base64' }];
        const scenario: Scenario = {
            title: 'Test Scenario',
            description: '',
            icon: null,
            inputType: 'file',
            analysisMode: 'quick',
            payload: { files }
        };
        const action = { type: actions.LOAD_SCENARIO, payload: scenario };
        const expectedState = {
            ...initialState,
            activeInput: 'file',
            analysisMode: 'quick',
            textContent: '',
            fileData: files,
        };
        expect(inputReducer(initialState, action)).toEqual(expectedState);
    });
});