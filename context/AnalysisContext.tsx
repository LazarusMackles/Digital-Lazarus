import React, { createContext, useReducer, useEffect, useContext, ReactNode, useCallback } from 'react';
import { analyzeContent } from '../services/geminiService';
import type { AnalysisResult, AnalysisMode, ForensicMode, Theme, InputType, AnalysisEvidence, Scenario } from '../types';

// --- STATE AND ACTION TYPES FOR REDUCER ---

type State = {
    textContent: string;
    imageData: string[] | null;
    url: string;
    isUrlValid: boolean;
    fileNames: string[] | null;
    isLoading: boolean;
    isReanalyzing: boolean;
    analysisResult: AnalysisResult | null;
    analysisTimestamp: string | null;
    analysisEvidence: AnalysisEvidence | null;
    analysisModeUsed: AnalysisMode | null;
    error: string | null;
    analysisMode: AnalysisMode;
    forensicMode: ForensicMode;
    showWelcome: boolean;
    theme: Theme;
    cooldown: number;
    activeInput: InputType;
};

type Action =
    | { type: 'SET_TEXT_CONTENT'; payload: string }
    | { type: 'SET_IMAGE_DATA'; payload: string[] | null }
    | { type: 'SET_URL'; payload: string }
    | { type: 'SET_IS_URL_VALID'; payload: boolean }
    | { type: 'SET_FILE_NAMES'; payload: string[] | null }
    | { type: 'SET_ANALYSIS_MODE'; payload: AnalysisMode }
    | { type: 'SET_FORENSIC_MODE'; payload: ForensicMode }
    | { type: 'SET_THEME'; payload: Theme }
    | { type: 'SET_SHOW_WELCOME'; payload: boolean }
    | { type: 'SET_ACTIVE_INPUT'; payload: InputType }
    | { type: 'HANDLE_FILES_CHANGE'; payload: { name: string, content?: string | null, imageBase64?: string | null }[] }
    | { type: 'CLEAR_FILES' }
    | { type: 'START_ANALYSIS'; payload: { isReanalyzing: boolean } }
    | { type: 'ANALYSIS_SUCCESS'; payload: { result: AnalysisResult; evidence: AnalysisEvidence | null; timestamp: string } }
    | { type: 'ANALYSIS_ERROR'; payload: string }
    | { type: 'NEW_ANALYSIS' }
    | { type: 'TICK_COOLDOWN' }
    | { type: 'LOAD_SCENARIO'; payload: Scenario };


// --- LOCALSTORAGE HELPERS ---

const getStoredItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        console.error(`Could not parse stored item '${key}':`, e);
        localStorage.removeItem(key);
        return defaultValue;
    }
};

// This preamble is added to the system instructions when a user challenges the initial verdict.
const secondOpinionPreamble = `CRITICAL RE-EVALUATION: Your trusted human partner has challenged your initial verdict, believing you have overlooked critical evidence. Your previous analysis may have been biased by "conceptual plausibility" (e.g., recognizing a real brand name). You are now under direct orders to re-evaluate the evidence using a different, more skeptical forensic protocol. Acknowledge this re-evaluation and your new, specific focus in your explanation.`;

interface AnalysisContextState extends State {
    dispatch: React.Dispatch<Action>;
    handleAnalyze: () => void;
    handleChallenge: (mode: ForensicMode) => void;
    handleNewAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextState | undefined>(undefined);

// --- REDUCER FUNCTION ---

const initialState: State = {
    textContent: getStoredItem('analysisTextContent', ''),
    imageData: getStoredItem('analysisImageData', null),
    url: getStoredItem('analysisUrl', ''),
    isUrlValid: true,
    fileNames: getStoredItem('analysisFileNames', null),
    isLoading: false,
    isReanalyzing: false,
    analysisResult: getStoredItem('analysisResult', null),
    analysisTimestamp: localStorage.getItem('analysisTimestamp'),
    analysisEvidence: getStoredItem('analysisEvidence', null),
    analysisModeUsed: getStoredItem('analysisModeUsed', null),
    error: null,
    analysisMode: 'quick',
    forensicMode: 'standard',
    showWelcome: false,
    theme: getStoredItem('theme', 'dark'),
    cooldown: 0,
    activeInput: 'text',
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_TEXT_CONTENT':
            return { ...state, textContent: action.payload };
        case 'SET_IMAGE_DATA':
            return { ...state, imageData: action.payload };
        case 'SET_URL':
            return { ...state, url: action.payload };
        case 'SET_IS_URL_VALID':
            return { ...state, isUrlValid: action.payload };
        case 'SET_FILE_NAMES':
            return { ...state, fileNames: action.payload };
        case 'SET_ANALYSIS_MODE':
            return { ...state, analysisMode: action.payload };
        case 'SET_FORENSIC_MODE':
            return { ...state, forensicMode: action.payload };
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_SHOW_WELCOME':
            return { ...state, showWelcome: action.payload };
        case 'SET_ACTIVE_INPUT': {
             // Reset other inputs when switching tabs
            const newState = { ...state, activeInput: action.payload, error: null };
            if (action.payload === 'text') {
                newState.url = '';
                newState.imageData = null;
                newState.fileNames = null;
            } else if (action.payload === 'url') {
                newState.textContent = '';
                newState.imageData = null;
                newState.fileNames = null;
            } else if (action.payload === 'file') {
                newState.textContent = '';
                newState.url = '';
            }
            return newState;
        }
        case 'HANDLE_FILES_CHANGE': {
            let textContent = '';
            let imageData: string[] | null = null;
            const fileNames = action.payload.map(f => f.name);
            const images = action.payload.map(f => f.imageBase64).filter((b64): b64 is string => !!b64);
            if (images.length > 0) imageData = images;
            const textFile = action.payload.find(f => f.content);
            if (textFile?.content) textContent = textFile.content;
            
            return { ...state, fileNames, imageData, textContent, activeInput: 'file' };
        }
        case 'CLEAR_FILES':
             return { ...state, imageData: null, fileNames: null, textContent: '' };
        case 'START_ANALYSIS':
            return { ...state, isLoading: true, isReanalyzing: action.payload.isReanalyzing, error: null, analysisResult: null };
        case 'ANALYSIS_SUCCESS': {
            const { result, evidence, timestamp } = action.payload;
            return { ...state, isLoading: false, analysisResult: result, analysisEvidence: evidence, analysisTimestamp: timestamp, analysisModeUsed: state.analysisMode };
        }
        case 'ANALYSIS_ERROR': {
            const errorMessage = action.payload;
            const needsCooldown = errorMessage.includes('overheating') || errorMessage.includes('quota');
            return { ...state, isLoading: false, error: errorMessage, analysisResult: null, cooldown: needsCooldown ? 60 : 0, analysisMode: needsCooldown ? 'quick' : state.analysisMode };
        }
        case 'NEW_ANALYSIS':
            // OPTIMIZATION: Clear all inputs for a true fresh start.
            return { 
                ...state, 
                analysisResult: null, 
                error: null, 
                analysisMode: 'quick', 
                forensicMode: 'standard', 
                analysisTimestamp: null, 
                analysisEvidence: null, 
                analysisModeUsed: null,
                textContent: '',
                imageData: null,
                url: '',
                isUrlValid: true,
                fileNames: null,
            };
        case 'TICK_COOLDOWN':
            return { ...state, cooldown: Math.max(0, state.cooldown - 1) };
        case 'LOAD_SCENARIO': {
            const { payload } = action;
            const newState: State = {
                ...state,
                activeInput: payload.inputType,
                analysisMode: payload.analysisMode,
                textContent: payload.payload.text || '',
                imageData: payload.payload.files?.map(f => f.imageBase64) || null,
                fileNames: payload.payload.files?.map(f => f.name) || null,
                url: '',
                isUrlValid: true,
                error: null,
            };
            return newState;
        }
        default:
            return state;
    }
};

export const AnalysisProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { textContent, imageData, url, analysisMode, forensicMode, activeInput, fileNames } = state;

    // Show welcome modal on first visit.
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            dispatch({ type: 'SET_SHOW_WELCOME', payload: true });
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    // Effect to centralize all localStorage synchronization as a side effect.
    useEffect(() => {
        // Sync theme
        localStorage.setItem('theme', state.theme);
        if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Sync analysis results and evidence
        if (state.analysisResult) {
            localStorage.setItem('analysisResult', JSON.stringify(state.analysisResult));
            localStorage.setItem('analysisEvidence', JSON.stringify(state.analysisEvidence));
            localStorage.setItem('analysisTimestamp', state.analysisTimestamp || '');
            localStorage.setItem('analysisTextContent', state.textContent);
            localStorage.setItem('analysisImageData', JSON.stringify(state.imageData));
            localStorage.setItem('analysisUrl', state.url);
            localStorage.setItem('analysisFileNames', JSON.stringify(state.fileNames));
            localStorage.setItem('analysisModeUsed', JSON.stringify(state.analysisModeUsed));
        } else {
             // If there's no result, it means we're in a new analysis state or an error occurred, so clear storage.
             localStorage.removeItem('analysisResult');
             localStorage.removeItem('analysisEvidence');
             localStorage.removeItem('analysisTimestamp');
             localStorage.removeItem('analysisModeUsed');
        }

    }, [
        state.theme, 
        state.analysisResult, 
        state.analysisEvidence, 
        state.analysisTimestamp, 
        state.textContent, 
        state.imageData, 
        state.url, 
        state.fileNames,
        state.analysisModeUsed
    ]);
    
    // Countdown timer for API rate limit cooldown.
    useEffect(() => {
        if (state.cooldown > 0) {
            const timer = setTimeout(() => dispatch({ type: 'TICK_COOLDOWN' }), 1000);
            return () => clearTimeout(timer);
        }
    }, [state.cooldown]);

    const runAnalysis = useCallback(async (isReanalyzing: boolean, overrideForensicMode?: ForensicMode) => {
        dispatch({ type: 'START_ANALYSIS', payload: { isReanalyzing } });
        try {
            const currentForensicMode = overrideForensicMode || forensicMode;
            const result = await analyzeContent({
                text: textContent,
                images: imageData,
                url,
                analysisMode,
                forensicMode: currentForensicMode,
                systemInstructionPreamble: isReanalyzing ? secondOpinionPreamble : undefined,
            });
            result.isSecondOpinion = isReanalyzing;

            const timestamp = new Date().toLocaleString();
            let evidence: AnalysisEvidence | null = null;
            if (activeInput === 'text' && textContent.trim()) {
                evidence = { type: 'text', content: textContent };
            } else if (activeInput === 'file' && fileNames && fileNames.length > 0) {
                evidence = { type: 'file', content: fileNames.join(', ') };
            } else if (activeInput === 'url' && url.trim()) {
                evidence = { type: 'url', content: url };
            }
            
            dispatch({ type: 'ANALYSIS_SUCCESS', payload: { result, evidence, timestamp } });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            dispatch({ type: 'ANALYSIS_ERROR', payload: errorMessage });
        }
    }, [textContent, imageData, url, analysisMode, forensicMode, activeInput, fileNames]);
    
    const handleAnalyze = useCallback(() => runAnalysis(false), [runAnalysis]);
    
    const handleChallenge = useCallback((mode: ForensicMode) => runAnalysis(true, mode), [runAnalysis]);
    
    const handleNewAnalysis = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        dispatch({ type: 'NEW_ANALYSIS' });
    }, []);

    const value = { ...state, dispatch, handleAnalyze, handleChallenge, handleNewAnalysis };

    return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
};

export const useAnalysis = (): AnalysisContextState => {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error('useAnalysis must be used within an AnalysisProvider');
    }
    return context;
};