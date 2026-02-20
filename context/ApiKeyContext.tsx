
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const GOOGLE_API_KEY_STORAGE_KEY = 'sleuther_google_api_key';
const SIGHTENGINE_API_KEY_STORAGE_KEY = 'sleuther_sightengine_api_key';

interface ApiKeyContextType {
    googleApiKey: string | null;
    sightengineApiKey: string | null;
    hasGoogleApiKey: boolean;
    hasSightengineApiKey: boolean;
    saveGoogleApiKey: (key: string) => void;
    saveSightengineApiKey: (key: string) => void;
    clearKeys: () => void;
}

// FIX: Exported ApiKeyContext so it can be used in other modules.
export const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state lazily from localStorage so it is available immediately on first render.
    const [googleApiKey, setGoogleApiKey] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(GOOGLE_API_KEY_STORAGE_KEY);
            if (stored) return stored;
            // Fallback to environment variable if available (provided by the platform)
            return (process.env.GEMINI_API_KEY as string) || null;
        }
        return null;
    });

    const [sightengineApiKey, setSightengineApiKey] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(SIGHTENGINE_API_KEY_STORAGE_KEY);
        }
        return null;
    });

    const clearKeys = useCallback(() => {
        localStorage.removeItem(GOOGLE_API_KEY_STORAGE_KEY);
        localStorage.removeItem(SIGHTENGINE_API_KEY_STORAGE_KEY);
        setGoogleApiKey((process.env.GEMINI_API_KEY as string) || null);
        setSightengineApiKey(null);
    }, []);

    const saveGoogleApiKey = useCallback((key: string) => {
        if (key) {
            localStorage.setItem(GOOGLE_API_KEY_STORAGE_KEY, key);
        } else {
            localStorage.removeItem(GOOGLE_API_KEY_STORAGE_KEY);
        }
        setGoogleApiKey(key || (process.env.GEMINI_API_KEY as string) || null);
    }, []);

    const saveSightengineApiKey = useCallback((key: string) => {
        if (key) {
            localStorage.setItem(SIGHTENGINE_API_KEY_STORAGE_KEY, key);
        } else {
            localStorage.removeItem(SIGHTENGINE_API_KEY_STORAGE_KEY);
        }
        setSightengineApiKey(key || null);
    }, []);

    const value = {
        googleApiKey,
        sightengineApiKey,
        hasGoogleApiKey: !!googleApiKey,
        hasSightengineApiKey: !!sightengineApiKey,
        saveGoogleApiKey,
        saveSightengineApiKey,
        clearKeys,
    };

    return (
        <ApiKeyContext.Provider value={value}>
            {children}
        </ApiKeyContext.Provider>
    );
};

export const useApiKeys = () => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKeys must be used within an ApiKeyProvider');
    }
    return context;
};
