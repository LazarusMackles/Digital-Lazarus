
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
}

// FIX: Exported ApiKeyContext so it can be used in other modules.
export const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [googleApiKey, setGoogleApiKey] = useState<string | null>(null);
    const [sightengineApiKey, setSightengineApiKey] = useState<string | null>(null);

    useEffect(() => {
        setGoogleApiKey(localStorage.getItem(GOOGLE_API_KEY_STORAGE_KEY));
        setSightengineApiKey(localStorage.getItem(SIGHTENGINE_API_KEY_STORAGE_KEY));
    }, []);

    const saveGoogleApiKey = useCallback((key: string) => {
        localStorage.setItem(GOOGLE_API_KEY_STORAGE_KEY, key);
        setGoogleApiKey(key);
    }, []);

    const saveSightengineApiKey = useCallback((key: string) => {
        localStorage.setItem(SIGHTENGINE_API_KEY_STORAGE_KEY, key);
        setSightengineApiKey(key);
    }, []);

    const value = {
        googleApiKey,
        sightengineApiKey,
        hasGoogleApiKey: !!googleApiKey,
        hasSightengineApiKey: !!sightengineApiKey,
        saveGoogleApiKey,
        saveSightengineApiKey,
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
