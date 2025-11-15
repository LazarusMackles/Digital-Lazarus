

import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useEffect } from 'react';
import type { Theme } from '../types';
import * as actions from './actions';

// State interface
export interface UIState {
    showWelcome: boolean;
    theme: Theme;
    isLoading: boolean;
    isStreaming: boolean;
    isReanalyzing: boolean;
    error: string | null;
    showSettingsModal: boolean;
    showApiKeyOnboarding: boolean;
}

// Initial state
export const initialState: UIState = {
    showWelcome: true,
    theme: 'dark',
    isLoading: false,
    isStreaming: false,
    isReanalyzing: false,
    error: null,
    showSettingsModal: false,
    showApiKeyOnboarding: false,
};

// Action types
type Action =
  | { type: typeof actions.SET_SHOW_WELCOME; payload: boolean }
  | { type: typeof actions.SET_THEME; payload: Theme }
  | { type: typeof actions.SET_LOADING; payload: boolean }
  | { type: typeof actions.SET_STREAMING; payload: boolean }
  | { type: typeof actions.SET_REANALYZING; payload: boolean }
  | { type: typeof actions.SET_ERROR; payload: string | null }
  | { type: typeof actions.CLEAR_ERROR }
  | { type: typeof actions.SET_SHOW_SETTINGS_MODAL; payload: boolean }
  | { type: typeof actions.SET_SHOW_API_KEY_ONBOARDING; payload: boolean };

// Reducer
const uiReducer = (state: UIState, action: Action): UIState => {
    switch (action.type) {
        case actions.SET_SHOW_WELCOME:
            return { ...state, showWelcome: action.payload };
        case actions.SET_THEME:
            return { ...state, theme: action.payload };
        case actions.SET_LOADING:
            return { ...state, isLoading: action.payload, error: action.payload ? null : state.error };
        case actions.SET_STREAMING:
            return { ...state, isStreaming: action.payload };
        case actions.SET_REANALYZING:
            return { ...state, isReanalyzing: action.payload };
        case actions.SET_ERROR:
            return { ...state, error: action.payload, isLoading: false, isStreaming: false, isReanalyzing: false };
        case actions.CLEAR_ERROR:
            return { ...state, error: null };
        case actions.SET_SHOW_SETTINGS_MODAL:
            return { ...state, showSettingsModal: action.payload };
        case actions.SET_SHOW_API_KEY_ONBOARDING:
            return { ...state, showApiKeyOnboarding: action.payload };
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