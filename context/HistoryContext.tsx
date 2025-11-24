import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { HistoryEntry, AnalysisResult, AnalysisAngle } from '../types';
import { v4 as uuidv4 } from 'uuid';

const HISTORY_STORAGE_KEY = 'sleuther_case_history';
const MAX_HISTORY_ITEMS = 10;

interface HistoryContextType {
    history: HistoryEntry[];
    addToHistory: (result: AnalysisResult, filename: string, analysisAngle: AnalysisAngle, modelUsed: string) => void;
    clearHistory: () => void;
}

export const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    const addToHistory = useCallback((result: AnalysisResult, filename: string, analysisAngle: AnalysisAngle, modelUsed: string) => {
        const newEntry: HistoryEntry = {
            id: uuidv4(),
            timestamp: new Date().toLocaleString(),
            filename,
            verdict: result.verdict,
            probability: result.probability,
            analysisAngle,
            modelUsed,
        };

        setHistory(prev => {
            const updated = [newEntry, ...prev];
            return updated.slice(0, MAX_HISTORY_ITEMS);
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return (
        <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};