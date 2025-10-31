import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { analyzeContent } from '../services/geminiService';
import type { AnalysisResult, AnalysisMode, ForensicMode } from '../types';

type Theme = 'light' | 'dark';

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
    analysisResult: AnalysisResult | null;
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
    handleAnalyze: () => void;
    handleChallenge: (mode: ForensicMode) => void;
    handleNewAnalysis: () => void;
    handleFilesChange: (files: { name: string, content?: string | null, imageBase64?: string | null }[]) => void;
    handleClearFiles: () => void;
}

const AnalysisContext = createContext<AnalysisContextState | undefined>(undefined);

export const AnalysisProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    // Helper to safely get item from localStorage
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
    
    const [textContent, setTextContent] = useState<string>(() => localStorage.getItem('analysisTextContent') || '');
    const [imageData, setImageData] = useState<string[] | null>(() => getStoredItem('analysisImageData', null));
    const [url, setUrl] = useState<string>(() => localStorage.getItem('analysisUrl') || '');
    const [fileNames, setFileNames] = useState<string[] | null>(() => getStoredItem('analysisFileNames', null));
    const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() => getStoredItem('analysisResult', null));
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('quick');
    const [forensicMode, setForensicMode] = useState<ForensicMode>('standard');
    const [showWelcome, setShowWelcome] = useState<boolean>(false);
    const [cooldown, setCooldown] = useState<number>(0);
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) return savedTheme;
        return 'dark';
    });

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('bg-slate-900');
            document.body.classList.remove('bg-slate-100');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.add('bg-slate-100');
            document.body.classList.remove('bg-slate-900');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const clearPersistedInputs = useCallback(() => {
        localStorage.removeItem('analysisTextContent');
        localStorage.removeItem('analysisImageData');
        localStorage.removeItem('analysisUrl');
        localStorage.removeItem('analysisFileNames');
    }, []);

    const runAnalysis = useCallback(async (analysisFn: () => Promise<AnalysisResult>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await analysisFn();
            setAnalysisResult(result);
            // Persist result and the inputs that generated it
            localStorage.setItem('analysisResult', JSON.stringify(result));
            localStorage.setItem('analysisTextContent', textContent);
            localStorage.setItem('analysisImageData', JSON.stringify(imageData));
            localStorage.setItem('analysisUrl', url);
            localStorage.setItem('analysisFileNames', JSON.stringify(fileNames));
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Sacre bleu! An unidentifiable error has occurred in the digital ether. Most mysterious!';
            setError(errorMessage);
            setAnalysisResult(null);
            localStorage.removeItem('analysisResult');
            clearPersistedInputs();

            if (errorMessage.includes('overheating') || errorMessage.includes('quota')) {
                setCooldown(60); // Start a 60-second cooldown
                setAnalysisMode('quick'); // Automatically switch to a less intensive mode
            }
        } finally {
            setIsLoading(false);
        }
    }, [textContent, imageData, url, fileNames, clearPersistedInputs]);

    const handleAnalyze = useCallback(async () => {
        if ((!textContent.trim() && (!imageData || imageData.length === 0) && !url.trim()) || (url.trim() && !isUrlValid)) {
            setError('Mon Dieu! You must provide some valid evidence for me to analyse!');
            return;
        }
        setAnalysisResult(null);
        localStorage.removeItem('analysisResult');
        
        await runAnalysis(async () => {
            const result = await analyzeContent({ text: textContent, images: imageData, url, analysisMode, forensicMode });
            result.isSecondOpinion = false;
            return result;
        });
    }, [runAnalysis, textContent, imageData, url, analysisMode, forensicMode, isUrlValid]);

    const handleChallenge = useCallback(async (mode: ForensicMode) => {
        await runAnalysis(async () => {
            const result = await analyzeContent({ 
                text: textContent, 
                images: imageData, 
                url, 
                analysisMode, 
                forensicMode: mode, 
                systemInstructionPreamble: secondOpinionPreamble 
            });
            result.isSecondOpinion = true; // Explicitly mark as a second opinion
            return result;
        });
    }, [runAnalysis, textContent, imageData, url, analysisMode]);
    
    const handleNewAnalysis = useCallback(() => {
        setAnalysisResult(null); // Return to the input screen
        setError(null); // Clear any previous errors
        setAnalysisMode('quick'); // Reset to default mode
        setForensicMode('standard'); // Reset to default mode
        localStorage.removeItem('analysisResult'); // Clear the persisted result
    }, []);
    
    const handleFilesChange = useCallback((files: { name: string, content?: string | null, imageBase64?: string | null }[]) => {
        setTextContent('');
        setImageData(null);
        setUrl('');
        
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
    }, []);

    const handleClearFiles = useCallback(() => {
        setImageData(null);
        setFileNames(null);
        setTextContent('');
    }, []);
    
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
        analysisResult,
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