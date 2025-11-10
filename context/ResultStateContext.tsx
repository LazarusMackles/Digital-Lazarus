import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { AnalysisResult, AnalysisEvidence, AnalysisMode } from '../types';
import * as actions from './actions';

// State interface
export interface ResultState {
    analysisResult: AnalysisResult | null;
    analysisTimestamp: string | null;
    analysisEvidence: AnalysisEvidence | null;
    analysisModeUsed: AnalysisMode | null;
    modelUsed: string | null;
}

// Initial state
// FIX: Export for testing.
export const initialState: ResultState = {
    analysisResult: null,
    analysisTimestamp: null,
    analysisEvidence: null,
    analysisModeUsed: null,
    modelUsed: null,
};

// Action types
type Action =
  | { type: typeof actions.START_ANALYSIS; payload: { evidence: AnalysisEvidence; analysisMode: AnalysisMode } }
  // FIX: Corrected typo from START_REANALysis to START_REANALYSIS
  | { type: typeof actions.START_REANALYSIS }
  | { type: typeof actions.ANALYSIS_SUCCESS; payload: { result: AnalysisResult; modelName: string; isSecondOpinion?: boolean } }
  | { type: typeof actions.NEW_ANALYSIS }
  | { type: typeof actions.STREAM_ANALYSIS_UPDATE; payload: { explanation: string } };

// Reducer
// FIX: Export for testing and provide default state.
export const resultReducer = (state: ResultState = initialState, action: Action): ResultState => {
    switch (action.type) {
        case actions.START_ANALYSIS: {
            const isDeepMode = action.payload.analysisMode === 'deep';
            const shouldStream = isDeepMode;

            return {
                ...state,
                // For any streaming analysis, create a placeholder result to show the result view immediately.
                analysisResult: shouldStream ? {
                    probability: 0,
                    verdict: 'Deducing...',
                    explanation: '',
                    isSecondOpinion: false,
                } : null,
                analysisEvidence: action.payload.evidence,
                analysisModeUsed: action.payload.analysisMode,
                modelUsed: null,
            };
        }
        // FIX: Corrected typo from START_REANALysis to START_REANALYSIS
        case actions.START_REANALYSIS:
            return {
                ...state,
                 analysisResult: {
                    ...state.analysisResult!,
                    explanation: '', // Clear previous explanation for streaming
                    isSecondOpinion: true,
                },
            };
        case actions.STREAM_ANALYSIS_UPDATE:
            if (!state.analysisResult) return state;
            return {
                ...state,
                 analysisResult: {
                    ...state.analysisResult,
                    explanation: action.payload.explanation,
                },
            };
        case actions.ANALYSIS_SUCCESS:
            return {
                ...state,
                analysisResult: { ...action.payload.result, isSecondOpinion: action.payload.isSecondOpinion },
                modelUsed: action.payload.modelName,
                analysisTimestamp: new Date().toLocaleString(),
            };
        case actions.NEW_ANALYSIS:
            // This action now simply resets the result state to its initial values.
            return initialState;
        default:
            return state;
    }
};

// Context
interface ResultStateContextType {
    state: ResultState;
    dispatch: Dispatch<Action>;
}
const ResultStateContext = createContext<ResultStateContextType | undefined>(undefined);

// Provider
export const ResultStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(resultReducer, initialState);

    return (
        <ResultStateContext.Provider value={{ state, dispatch }}>
            {children}
        </ResultStateContext.Provider>
    );
};

// Hook
export const useResultState = () => {
    const context = useContext(ResultStateContext);
    if (context === undefined) {
        throw new Error('useResultState must be used within an ResultStateProvider');
    }
    return context;
};