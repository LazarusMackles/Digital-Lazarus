import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { analyzeContent } from '../services/geminiService';
import type { 
    AnalysisResult, 
    AnalysisMode, 
    ForensicMode, 
    Theme, 
    InputType, 
    AnalysisEvidence, 
    Scenario 
} from '../types';

interface AnalysisState {
    // UI State
    isLoading: boolean;
    isReanalyzing: boolean;
    error: string | null;
    showWelcome: boolean;
    theme: Theme;
    
    // Result State
    analysisResult: AnalysisResult | null;
    analysisTimestamp: string | null;
    analysisEvidence: AnalysisEvidence | null;
    analysisModeUsed: AnalysisMode | null;

    // Input State
    textContent: string;
    fileData: { name: string; imageBase64?: string | null; content?: string | null }[];
    url: string;
    activeInput: InputType;
    analysisMode: AnalysisMode;
    forensicMode: ForensicMode;
}

const initialState: AnalysisState = {
    isLoading: false,
    isReanalyzing: false,
    error: null,
    showWelcome: true,
    theme: 'dark',
    analysisResult: null,
    analysisTimestamp: null,
    analysisEvidence: null,
    analysisModeUsed: null,
    textContent: '',
    fileData: [],
    url: '',
    activeInput: 'text',
    analysisMode: 'quick',
    forensicMode: 'standard',
};

type Action =
  | { type: 'START_ANALYSIS'; payload: { evidence: AnalysisEvidence; forensicMode: ForensicMode } }
  | { type: 'START_REANALYSIS'; payload: { forensicMode: ForensicMode } }
  | { type: 'ANALYSIS_SUCCESS'; payload: { result: AnalysisResult; isSecondOpinion?: boolean } }
  | { type: 'ANALYSIS_ERROR'; payload: string }
  | { type: 'NEW_ANALYSIS' }
  | { type: 'SET_SHOW_WELCOME'; payload: boolean }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_TEXT_CONTENT'; payload: string }
  | { type: 'SET_FILE_DATA'; payload: { name: string; imageBase64?: string | null; content?: string | null }[] }
  | { type: 'CLEAR_FILES' }
  | { type: 'SET_URL'; payload: string }
  | { type: 'SET_ACTIVE_INPUT'; payload: InputType }
  | { type: 'SET_ANALYSIS_MODE'; payload: AnalysisMode }
  | { type: 'SET_FORENSIC_MODE'; payload: ForensicMode }
  | { type: 'LOAD_SCENARIO'; payload: Scenario };


const analysisReducer = (state: AnalysisState, action: Action): AnalysisState => {
    switch (action.type) {
        case 'START_ANALYSIS':
            return {
                ...state,
                isLoading: true,
                isReanalyzing: false,
                error: null,
                analysisResult: null,
                analysisEvidence: action.payload.evidence,
                analysisModeUsed: state.analysisMode, // Use mode from state
                forensicMode: action.payload.forensicMode,
            };
        case 'START_REANALYSIS':
            return {
                ...state,
                isLoading: true,
                isReanalyzing: true,
                error: null,
                forensicMode: action.payload.forensicMode,
            };
        case 'ANALYSIS_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isReanalyzing: false,
                analysisResult: { ...action.payload.result, isSecondOpinion: action.payload.isSecondOpinion },
                analysisTimestamp: new Date().toLocaleString(),
            };
        case 'ANALYSIS_ERROR':
            return {
                ...state,
                isLoading: false,
                isReanalyzing: false,
                error: action.payload,
            };
        case 'NEW_ANALYSIS':
            return {
                ...initialState,
                showWelcome: false, // Don't show welcome again
                theme: state.theme, // Persist theme
            };
        case 'SET_SHOW_WELCOME':
            return { ...state, showWelcome: action.payload };
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_TEXT_CONTENT':
            return { ...state, textContent: action.payload, fileData: [], url: '' };
        case 'SET_FILE_DATA':
            return { ...state, fileData: action.payload, textContent: '', url: '' };
        case 'CLEAR_FILES':
            return { ...state, fileData: [] };
        case 'SET_URL':
            return { ...state, url: action.payload, textContent: '', fileData: [] };
        case 'SET_ACTIVE_INPUT':
            return { ...state, activeInput: action.payload };
        case 'SET_ANALYSIS_MODE':
            return { ...state, analysisMode: action.payload };
        case 'SET_FORENSIC_MODE':
            return { ...state, forensicMode: action.payload };
        case 'LOAD_SCENARIO':
            const { inputType, analysisMode, payload } = action.payload;
            return {
                ...initialState,
                showWelcome: false,
                theme: state.theme,
                activeInput: inputType,
                analysisMode,
                textContent: payload.text || '',
                fileData: payload.files || [],
            };
        default:
            return state;
    }
};

interface AnalysisContextType extends AnalysisState {
    dispatch: Dispatch<Action>;
    handleNewAnalysis: () => void;
    handleChallenge: (mode: ForensicMode) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(analysisReducer, initialState);

    useEffect(() => {
        if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [state.theme]);

    const handleNewAnalysis = () => dispatch({ type: 'NEW_ANALYSIS' });
    
    const handleChallenge = (forensicMode: ForensicMode) => {
        if (!state.analysisEvidence) return;
        dispatch({ type: 'START_REANALYSIS', payload: { forensicMode } });

        const images = state.analysisEvidence.type === 'file' ? state.fileData.map(f => f.imageBase64).filter(Boolean) as string[] : null;
        
        analyzeContent({
            text: null,
            images: images,
            url: null,
            analysisMode: 'deep', // Re-analysis is always deep
            forensicMode: forensicMode,
            systemInstructionPreamble: "This is a re-analysis. The user was not satisfied with the initial verdict. Adopt a more critical, skeptical perspective. Focus specifically on the requested forensic angle and provide a fresh, more detailed explanation."
        })
        .then(result => dispatch({ type: 'ANALYSIS_SUCCESS', payload: { result, isSecondOpinion: true } }))
        .catch(error => dispatch({ type: 'ANALYSIS_ERROR', payload: error.message }));
    };

    return (
        <AnalysisContext.Provider value={{ ...state, dispatch, handleNewAnalysis, handleChallenge }}>
            {children}
        </AnalysisContext.Provider>
    );
};

export const useAnalysis = () => {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error('useAnalysis must be used within an AnalysisProvider');
    }
    return context;
};