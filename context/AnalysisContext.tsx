import React, { createContext, useState, useCallback, useEffect, useContext, ReactNode } from 'react';
import { analyzeContent } from '../services/geminiService';
import type { AnalysisResult, AnalysisMode, ForensicMode } from '../types';

type Theme = 'light' | 'dark';

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
    isChallenged: boolean;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    handleAnalyze: () => void;
    handleChallenge: (mode: ForensicMode) => void;
    handleNewAnalysis: () => void;
    handleFilesChange: (files: { name: string, content?: string | null, imageBase64?: string | null }[]) => void;
    handleClearFiles: () => void;
}

const AnalysisContext = createContext<AnalysisContextState | undefined>(undefined);

export const AnalysisProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [textContent, setTextContent] = useState<string>('');
    const [imageData, setImageData] = useState<string[] | null>(null);
    const [url, setUrl] = useState<string>('');
    const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
    const [fileNames, setFileNames] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('quick');
    const [forensicMode, setForensicMode] = useState<ForensicMode>('standard');
    const [showWelcome, setShowWelcome] = useState<boolean>(false);
    const [isChallenged, setIsChallenged] = useState<boolean>(false);
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
    
    const runAnalysis = useCallback(async (analysisFn: () => Promise<AnalysisResult>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await analysisFn();
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Sacre bleu! An unidentifiable error has occurred in the digital ether. Most mysterious!');
            }
            // Clear results on error so user isn't stuck on result screen
            setAnalysisResult(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnalyze = useCallback(async () => {
        if ((!textContent.trim() && (!imageData || imageData.length === 0) && !url.trim()) || (url.trim() && !isUrlValid)) {
            setError('Mon Dieu! You must provide some valid evidence for me to analyse!');
            return;
        }
        setAnalysisResult(null);
        setIsChallenged(false);
        await runAnalysis(() => analyzeContent({ text: textContent, images: imageData, url, analysisMode, forensicMode, isChallenge: false }));
    }, [textContent, imageData, url, analysisMode, forensicMode, isUrlValid, runAnalysis]);

    const handleChallenge = useCallback(async (mode: ForensicMode) => {
        setIsChallenged(true);
        // Intentionally not clearing analysisResult to feel like an update
        await runAnalysis(() => analyzeContent({ text: textContent, images: imageData, url, analysisMode, forensicMode: mode, isChallenge: true }));
    }, [textContent, imageData, url, analysisMode, runAnalysis]);
    
    const handleNewAnalysis = () => {
        setAnalysisResult(null);
        setError(null);
        setIsChallenged(false);
    };
    
    const handleFilesChange = (files: { name: string, content?: string | null, imageBase64?: string | null }[]) => {
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
    };

    const handleClearFiles = () => {
        setImageData(null);
        setFileNames(null);
        setTextContent('');
    }
    
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
        isChallenged,
        theme,
        setTheme,
        handleAnalyze,
        handleChallenge,
        handleNewAnalysis,
        handleFilesChange,
        handleClearFiles
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
