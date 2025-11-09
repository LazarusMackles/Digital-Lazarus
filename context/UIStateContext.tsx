
import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useEffect } from 'react';
import type { Theme } from '../types';
import * as actions from './actions';

// State interface
export interface UIState {
    showWelcome: boolean;
    theme: Theme;
}

// Initial state
const initialState: UIState = {
    showWelcome: true,
    theme: 'dark',
};

// Action types
type Action =
  | { type: typeof actions.SET_SHOW_WELCOME; payload: boolean }
  | { type: typeof actions.SET_THEME; payload: Theme };

// Reducer
const uiReducer = (state: UIState, action: Action): UIState => {
    switch (action.type) {
        case actions.SET_SHOW_WELCOME:
            return { ...state, showWelcome: action.payload };
        case actions.SET_THEME:
            return { ...state, theme: action.payload };
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
