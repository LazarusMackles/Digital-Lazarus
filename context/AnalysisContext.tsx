import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { analyzeContent } from '../services/geminiService';
import type { AnalysisResult, AnalysisMode, ForensicMode, Theme, InputType, AnalysisEvidence } from '../types';

// This preamble is added to the system instructions when a user challenges the initial verdict.
const secondOpinionPreamble = `CRITICAL RE-EVALUATION: Your trusted human partner has challenged your initial verdict, believing you have overlooked critical evidence. Your previous analysis may have been biased by "conceptual plausibility" (e.g., recognizing a real brand name). You are now under direct orders to re-evaluate the evidence using a different, more skeptical forensic protocol. Acknowledge this re-evaluation and your new, specific focus in your explanation.`;

interface AnalysisContextState {
    textContent: string;
    setTextContent: (text: string) => void;
    imageData: string[] | null;
    setImageData: (data: string[] | null) => void;
    url: string;
    setUrl: (url: string) => void;
    isUrlValid: boolean;
    setIsUrlValid: (isValid: boolean) => void;
    fileNames: string[] | null;
    isLoading: boolean;
    isReanalyzing: boolean;
    analysisResult: AnalysisResult | null;
    analysisTimestamp: string | null;
    analysisEvidence: AnalysisEvidence | null;
    error: string | null;
    analysisMode: AnalysisMode;
    setAnalysisMode: (mode: AnalysisMode) => void;
    forensicMode: ForensicMode;
    setForensicMode: (mode: ForensicMode) => void;
    showWelcome: boolean;
    setShowWelcome: (show: boolean) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    cooldown: number;
    activeInput: InputType;
    setActiveInput: (type: InputType) => void;
    handleAnalyze: () => void;
    handleChallenge: (mode: ForensicMode) => void;
    handleNewAnalysis: () => void;
    handleFilesChange: (files: { name: string, content?: string | null, imageBase64?: string | null }[]) => void;
    handleClearFiles: () => void;
}

const AnalysisContext = createContext<AnalysisContextState | undefined>(undefined);

export const AnalysisProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    // Helper to safely get item from localStorage, preventing crashes from malformed JSON.
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
    
    // --- STATE MANAGEMENT ---
    const [textContent, setTextContent] = useState<string>(() => localStorage.getItem('analysisTextContent') || '');
    const [imageData, setImageData] = useState<string[] | null>(() => getStoredItem('analysisImageData', null));
    const [url, setUrl] = useState<string>(() => localStorage.getItem('analysisUrl') || '');
    const [fileNames, setFileNames] = useState<string[] | null>(() => getStoredItem('analysisFileNames', null));
    const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() => getStoredItem('analysisResult', null));
    const [analysisTimestamp, setAnalysisTimestamp] = useState<string | null>(() => localStorage.getItem('analysisTimestamp'));
    const [analysisEvidence, setAnalysisEvidence] = useState<AnalysisEvidence | null>(() => getStoredItem('analysisEvidence', null));
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('quick');
    const [forensicMode, setForensicMode] = useState<ForensicMode>('standard');
    const [showWelcome, setShowWelcome] = useState<boolean>(false);
    const [cooldown, setCooldown] = useState<number>(0);
    const [activeInput, _setActiveInput] = useState<InputType>('file');
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'dark'; // Default to dark mode
    });

    // --- EFFECTS ---

    // Show welcome modal on first visit.
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    // Apply theme changes to the document.
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // Countdown timer for API rate limit cooldown.
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // --- CORE LOGIC FUNCTIONS (MEMOIZED) ---

    // Central function to run any analysis, handling loading, errors, and persistence.
    const runAnalysis = useCallback(async (analysisFn: () => Promise<AnalysisResult>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await analysisFn();
            setAnalysisResult(result);
            
            // Capture and persist timestamp and evidence context on success.
            const timestamp = new Date().toLocaleString();
            setAnalysisTimestamp(timestamp);
            localStorage.setItem('analysisTimestamp', timestamp);

            let evidence: AnalysisEvidence | null = null;
            if (activeInput === 'text' && textContent.trim()) {
                evidence = { type: 'text', content: textContent };
            } else if (activeInput === 'file' && fileNames && fileNames.length > 0) {
                evidence = { type: 'file', content: fileNames.join(', ') };
            } else if (activeInput === 'url' && url.trim()) {
                evidence = { type: 'url', content: url };
            }

            if (evidence) {
                setAnalysisEvidence(evidence);
                localStorage.setItem('analysisEvidence', JSON.stringify(evidence));
            }

            // Persist successful result and the inputs that generated it.
            localStorage.setItem('analysisResult', JSON.stringify(result));
            localStorage.setItem('analysisTextContent', textContent);
            localStorage.setItem('analysisImageData', JSON.stringify(imageData));
            localStorage.setItem('analysisUrl', url);
            localStorage.setItem('analysisFileNames', JSON.stringify(fileNames));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setAnalysisResult(null);
            localStorage.removeItem('analysisResult');
            localStorage.removeItem('analysisTimestamp');
            localStorage.removeItem('analysisEvidence');
            // Do not clear inputs on error, so user can retry.

            if (errorMessage.includes('overheating') || errorMessage.includes('quota')) {
                setCooldown(60); 
                setAnalysisMode('quick');
            }
        } finally {
            setIsLoading(false);
        }
    }, [textContent, imageData, url, fileNames, activeInput]);
    
    const handleClearFiles = useCallback(() => {
        setImageData(null);
        setFileNames(null);
        setTextContent('');
    }, []);

    const setActiveInput = useCallback((tab: InputType) => {
        _setActiveInput(tab);
        setError(null);
        if (tab === 'text') {
            setUrl('');
            setImageData(null);
            setFileNames(null);
        } else if (tab === 'url') {
            setTextContent('');
            setImageData(null);
            setFileNames(null);
        } else if (tab === 'file') {
            setTextContent('');
            setUrl('');
        }
    }, []);

    // Handler for the main "Deduce" button click.
    const handleAnalyze = useCallback(async () => {
        if ((!textContent.trim() && (!imageData || imageData.length === 0) && !url.trim()) || (url.trim() && !isUrlValid)) {
            setError('Mon Dieu! You must provide some valid evidence for me to analyse!');
            return;
        }
        setIsReanalyzing(false);
        setAnalysisResult(null);
        setAnalysisTimestamp(null);
        setAnalysisEvidence(null);
        localStorage.removeItem('analysisResult');
        localStorage.removeItem('analysisTimestamp');
        localStorage.removeItem('analysisEvidence');
        
        await runAnalysis(async () => {
            const result = await analyzeContent({ text: textContent, images: imageData, url, analysisMode, forensicMode });
            result.isSecondOpinion = false;
            return result;
        });
    }, [runAnalysis, textContent, imageData, url, analysisMode, forensicMode, isUrlValid]);

    // Handler for the "Challenge Verdict" buttons.
    const handleChallenge = useCallback(async (mode: ForensicMode) => {
        setIsReanalyzing(true);
        await runAnalysis(async () => {
            const result = await analyzeContent({ 
                text: textContent, 
                images: imageData, 
                url, 
                analysisMode, 
                forensicMode: mode, 
                systemInstructionPreamble: secondOpinionPreamble 
            });
            result.isSecondOpinion = true;
            return result;
        });
    }, [runAnalysis, textContent, imageData, url, analysisMode]);
    
    // Handler for "New Analysis". Resets analysis state but keeps input evidence.
    const handleNewAnalysis = useCallback(() => {
        setAnalysisResult(null);
        setError(null);
        setAnalysisMode('quick');
        setForensicMode('standard');
        setAnalysisTimestamp(null);
        setAnalysisEvidence(null);
        localStorage.removeItem('analysisResult');
        localStorage.removeItem('analysisTimestamp');
        localStorage.removeItem('analysisEvidence');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    
    // Handler for file uploads. Resets other input types to ensure single-mode analysis.
    const handleFilesChange = useCallback((files: { name: string, content?: string | null, imageBase64?: string | null }[]) => {
        setActiveInput('file');
        
        if (files.length > 0) {
            const names = files.map(f => f.name);
            setFileNames(names);

            const images = files.map(f => f.imageBase64).filter((b64): b64 is string => !!b64);
            if (images.length > 0) {
                setImageData(images);
            }

            const textFile = files.find(f => f.content);
            if (textFile && textFile.content) {
                setTextContent(textFile.content);
            }
        }
    }, [setActiveInput]);
    
    const value = {
        textContent,
        setTextContent,
        imageData,
        setImageData,
        url,
        setUrl,
        isUrlValid,
        setIsUrlValid,
        fileNames,
        isLoading,
        isReanalyzing,
        analysisResult,
        analysisTimestamp,
        analysisEvidence,
        error,
        analysisMode,
        setAnalysisMode,
        forensicMode,
        setForensicMode,
        showWelcome,
        setShowWelcome,
        theme,
        setTheme,
        cooldown,
        activeInput,
        setActiveInput,
        handleAnalyze,
        handleChallenge,
        handleNewAnalysis,
        handleFilesChange,
        handleClearFiles,
    };

    return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
};

export const useAnalysis = (): AnalysisContextState => {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error('useAnalysis must be used within an AnalysisProvider');
    }
    return context;
};