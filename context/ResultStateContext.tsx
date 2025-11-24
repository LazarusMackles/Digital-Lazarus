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
  | { type: typeof actions.START_REANALYSIS }
  | { type: typeof actions.ANALYSIS_SUCCESS; payload: { result: AnalysisResult; modelName: string; isSecondOpinion?: boolean } }
  | { type: typeof actions.NEW_ANALYSIS }
  | { type: typeof actions.STREAM_ANALYSIS_UPDATE; payload: { explanation: string } };

// Reducer
export const resultReducer = (state: ResultState = initialState, action: Action): ResultState => {
    switch (action.type) {
        case actions.START_ANALYSIS: {
            const isProvenance = action.payload.analysisAngle === 'provenance';
            return {
                ...initialState, // Clear previous results completely
                analysisEvidence: action.payload.evidence,
                analysisAngleUsed: action.payload.analysisAngle,
                analysisResult: isProvenance
                    ? {
                        probability: 0,
                        verdict: 'Deducing ...',
                        explanation: '',
                        isSecondOpinion: false,
                    }
                    : null,
            };
        }
        case actions.START_REANALYSIS:
            return {
                ...state,
                 analysisResult: {
                    ...state.analysisResult!,
                    explanation: '', 
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
// Exporting Context for Testing purposes
export const ResultStateContext = createContext<ResultStateContextType | undefined>(undefined);

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