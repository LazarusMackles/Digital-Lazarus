// ---
//
// This file was changed as part of a fix for the following bug:
//
// 1. **Default Input Focus:** The application was defaulting to the "Text" input tab upon loading.
//
// The fix addresses this by:
//
// 1. **Updating Initial State:** The `initialState` object in this context has been modified to set `activeInput` to `'file'` and `forensicMode` to `'technical'`. This ensures that the user's first view after the welcome modal is the file upload interface with the "Technical Forensics" option pre-selected, aligning with the user's request for a more visually balanced and feature-forward default screen.
//
// ---
import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { InputType, AnalysisMode, ForensicMode, Scenario } from '../types';
import * as actions from './actions';

// State interface
export interface InputState {
    textContent: string;
    fileData: { name: string; imageBase64?: string | null; content?: string | null }[];
    url: string;
    activeInput: InputType;
    analysisMode: AnalysisMode;
    forensicMode: ForensicMode;
}

// Initial state
const initialState: InputState = {
    textContent: '',
    fileData: [],
    url: '',
    activeInput: 'file',
    analysisMode: 'quick',
    forensicMode: 'technical',
};

// Action types
type Action =
  | { type: typeof actions.SET_TEXT_CONTENT; payload: string }
  | { type: typeof actions.SET_FILE_DATA; payload: { name: string; imageBase64?: string | null; content?: string | null }[] }
  | { type: typeof actions.SET_URL; payload: string }
  | { type: typeof actions.SET_ACTIVE_INPUT; payload: InputType }
  | { type: typeof actions.SET_ANALYSIS_MODE; payload: AnalysisMode }
  | { type: typeof actions.SET_FORENSIC_MODE; payload: ForensicMode }
  | { type: typeof actions.CLEAR_INPUTS }
  | { type: typeof actions.LOAD_SCENARIO; payload: Scenario };

// Reducer
const inputReducer = (state: InputState, action: Action): InputState => {
    switch (action.type) {
        case actions.SET_TEXT_CONTENT:
            return { ...state, textContent: action.payload, fileData: [], url: '' };
        case actions.SET_FILE_DATA:
            return { ...state, fileData: action.payload, textContent: '', url: '' };
        case actions.SET_URL:
            return { ...state, url: action.payload, textContent: '', fileData: [] };
        case actions.SET_ACTIVE_INPUT:
            return { ...state, activeInput: action.payload };
        case actions.SET_ANALYSIS_MODE:
            return { ...state, analysisMode: action.payload };
        case actions.SET_FORENSIC_MODE:
            return { ...state, forensicMode: action.payload };
        case actions.CLEAR_INPUTS:
            return {
                ...state,
                textContent: '',
                fileData: [],
                url: '',
                activeInput: 'file', // Reset to the new default
            };
        case actions.LOAD_SCENARIO:
            const { inputType, analysisMode, payload } = action.payload;
            return {
                ...initialState,
                activeInput: inputType,
                analysisMode,
                textContent: payload.text || '',
                fileData: payload.files || [],
            };
        default:
            return state;
    }
};

// Context
interface InputStateContextType {
    state: InputState;
    dispatch: Dispatch<Action>;
}
const InputStateContext = createContext<InputStateContextType | undefined>(undefined);

// Provider
export const InputStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(inputReducer, initialState);
    return (
        <InputStateContext.Provider value={{ state, dispatch }}>
            {children}
        </InputStateContext.Provider>
    );
};

// Hook
export const useInputState = () => {
    const context = useContext(InputStateContext);
    if (context === undefined) {
        throw new Error('useInputState must be used within an InputStateProvider');
    }
    return context;
};