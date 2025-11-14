import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { InputType, AnalysisAngle, Scenario } from '../types';
import * as actions from './actions';

// State interface
export interface InputState {
    textContent: string;
    fileData: { name: string; imageBase64?: string | null; content?: string | null } | null;
    activeInput: InputType;
    analysisAngle: AnalysisAngle;
}

// Initial state
// FIX: Export for testing.
export const initialState: InputState = {
    textContent: '',
    fileData: null,
    activeInput: 'file',
    analysisAngle: 'forensic',
};

// Action types
type Action =
  | { type: typeof actions.SET_TEXT_CONTENT; payload: string }
  | { type: typeof actions.SET_FILE_DATA; payload: { name: string; imageBase64?: string | null; content?: string | null } | null }
  | { type: typeof actions.SET_ACTIVE_INPUT; payload: InputType }
  | { type: typeof actions.SET_ANALYSIS_ANGLE; payload: AnalysisAngle }
  | { type: typeof actions.CLEAR_INPUTS }
  | { type: typeof actions.LOAD_SCENARIO; payload: Scenario };

// Reducer
// FIX: Export for testing and provide default state.
export const inputReducer = (state: InputState = initialState, action: Action): InputState => {
    switch (action.type) {
        case actions.SET_TEXT_CONTENT:
            return { ...state, textContent: action.payload, fileData: null };
        case actions.SET_FILE_DATA:
            return { ...state, fileData: action.payload, textContent: '' };
        case actions.SET_ACTIVE_INPUT:
            return {
                ...state,
                activeInput: action.payload,
            };
        case actions.SET_ANALYSIS_ANGLE:
            return { ...state, analysisAngle: action.payload };
        case actions.CLEAR_INPUTS:
            return {
                ...state,
                textContent: '',
                fileData: null,
                activeInput: 'file', // Reset to the new default
                analysisAngle: 'forensic', 
            };
        case actions.LOAD_SCENARIO:
            const { inputType, payload } = action.payload;
            return {
                ...initialState,
                activeInput: inputType,
                textContent: payload.text || '',
                fileData: payload.file || null,
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