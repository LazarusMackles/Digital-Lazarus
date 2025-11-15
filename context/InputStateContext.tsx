import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { AnalysisAngle, Scenario } from '../types';
import * as actions from './actions';

// State interface
export interface InputState {
    fileData: { name: string; imageBase64?: string | null; content?: string | null } | null;
    analysisAngle: AnalysisAngle;
}

// Initial state
export const initialState: InputState = {
    fileData: null,
    analysisAngle: 'forensic',
};

// Action types
type Action =
  | { type: typeof actions.SET_FILE_DATA; payload: { name: string; imageBase64?: string | null; content?: string | null } | null }
  | { type: typeof actions.SET_ANALYSIS_ANGLE; payload: AnalysisAngle }
  | { type: typeof actions.CLEAR_INPUTS }
  | { type: typeof actions.LOAD_SCENARIO; payload: Scenario };

// Reducer
export const inputReducer = (state: InputState = initialState, action: Action): InputState => {
    switch (action.type) {
        case actions.SET_FILE_DATA:
            return { ...state, fileData: action.payload };
        case actions.SET_ANALYSIS_ANGLE:
            return { ...state, analysisAngle: action.payload };
        case actions.CLEAR_INPUTS:
            return {
                ...initialState
            };
        case actions.LOAD_SCENARIO:
            const { payload } = action.payload;
            return {
                ...initialState,
                fileData: payload.file,
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