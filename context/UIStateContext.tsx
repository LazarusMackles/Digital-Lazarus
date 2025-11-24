
import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useEffect } from 'react';
import type { Theme } from '../types';
import * as actions from './actions';

export type AnalysisStage = 'idle' | 'analyzing_pixels' | 'analyzing_context' | 'complete' | 'error';

const WELCOME_SEEN_KEY = 'sleuther_welcome_seen';

// State interface
export interface UIState {
    showWelcome: boolean;
    theme: Theme;
    analysisStage: AnalysisStage;
    error: string | null;
    showSettingsModal: boolean;
    showApiKeyOnboarding: boolean;
}

// Initial state
export const initialState: UIState = {
    showWelcome: typeof window !== 'undefined' ? !localStorage.getItem(WELCOME_SEEN_KEY) : true,
    theme: 'dark',
    analysisStage: 'idle',
    error: null,
    showSettingsModal: false,
    showApiKeyOnboarding: false,
};

// Action types
type Action =
  | { type: typeof actions.SET_SHOW_WELCOME; payload: boolean }
  | { type: typeof actions.SET_THEME; payload: Theme }
  | { type: typeof actions.SET_ERROR; payload: string | null }
  | { type: typeof actions.CLEAR_ERROR }
  | { type: typeof actions.SET_SHOW_SETTINGS_MODAL; payload: boolean }
  | { type: typeof actions.SET_SHOW_API_KEY_ONBOARDING; payload: boolean }
  | { type: typeof actions.START_PIXEL_ANALYSIS }
  | { type: typeof actions.START_CONTEXT_ANALYSIS }
  | { type: typeof actions.ANALYSIS_COMPLETE }
  | { type: typeof actions.RESET_ANALYSIS_STATE };

// Reducer
const uiReducer = (state: UIState, action: Action): UIState => {
    switch (action.type) {
        case actions.SET_SHOW_WELCOME:
            if (action.payload === false) {
                localStorage.setItem(WELCOME_SEEN_KEY, 'true');
            }
            return { ...state, showWelcome: action.payload };
        case actions.SET_THEME:
            return { ...state, theme: action.payload };
        case actions.SET_ERROR:
            return { ...state, error: action.payload, analysisStage: 'error' };
        case actions.CLEAR_ERROR:
            return { ...state, error: null };
        case actions.SET_SHOW_SETTINGS_MODAL:
            return { ...state, showSettingsModal: action.payload };
        case actions.SET_SHOW_API_KEY_ONBOARDING:
            return { ...state, showApiKeyOnboarding: action.payload };
        
        // State machine actions
        case actions.START_PIXEL_ANALYSIS:
            return { ...state, analysisStage: 'analyzing_pixels', error: null };
        case actions.START_CONTEXT_ANALYSIS:
            return { ...state, analysisStage: 'analyzing_context', error: null };
        case actions.ANALYSIS_COMPLETE:
            return { ...state, analysisStage: 'complete' };
        case actions.RESET_ANALYSIS_STATE:
             return { ...state, analysisStage: 'idle', error: null };
        default:
            return state;
    }
};

// Context
interface UIStateContextType {
    state: UIState;
    dispatch: Dispatch<Action>;
}
const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

// Provider
export const UIStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(uiReducer, initialState);

    useEffect(() => {
        if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [state.theme]);

    return (
        <UIStateContext.Provider value={{ state, dispatch }}>
            {children}
        </UIStateContext.Provider>
    );
};

// Hook
export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === undefined) {
        throw new Error('useUIState must be used within an UIStateProvider');
    }
    return context;
};
