import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { AnalysisResult, AnalysisEvidence, AnalysisAngle } from '../types';
import * as actions from './actions';

// State interface
export interface ResultState {
    analysisResult: AnalysisResult | null;
    analysisTimestamp: string | null;
    analysisEvidence: AnalysisEvidence | null;
    analysisAngleUsed: AnalysisAngle | null;
    modelUsed: string | null;
}

// Initial state
// FIX: Export for testing.
export const initialState: ResultState = {
    analysisResult: null,
    analysisTimestamp: null,
    analysisEvidence: null,
    analysisAngleUsed: null,
    modelUsed: null,
};

// Action types
type Action =
  | { type: typeof actions.START_ANALYSIS; payload: { evidence: AnalysisEvidence; analysisAngle: AnalysisAngle } }
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
            // Streaming is now determined by input type (text) rather than a mode.
            const isTextAnalysis = action.payload.evidence.type === 'text';
            return {
                ...initialState, // Clear previous results completely
                analysisEvidence: action.payload.evidence,
                analysisAngleUsed: action.payload.analysisAngle,
                analysisResult: isTextAnalysis
                    ? {
                        probability: 0,
                        verdict: 'Deducing ...',
                        explanation: '',
                        isSecondOpinion: false,
                    }
                    : null,
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
            if (!state.analysisResult) {
                 return {
                     ...state,
                     analysisResult: {
                         probability: 0,
                         verdict: 'Deducing ...',
                         explanation: action.payload.explanation,
                         isSecondOpinion: state.analysisResult?.isSecondOpinion || false,
                     }
                 }
            }
            return {
                ...state,
                 analysisResult: {
                    ...state.analysisResult,
                    // FIX: The streaming service sends the *entire* explanation found so far.
                    // We should replace the state, not append to it, to avoid duplication.
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
