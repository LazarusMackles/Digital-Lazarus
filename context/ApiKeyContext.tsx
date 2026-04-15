
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const GOOGLE_API_KEY_STORAGE_KEY = 'sleuther_google_api_key';
const HIVE_ACCESS_KEY_STORAGE_KEY = 'sleuther_hive_access_key';
const HIVE_SECRET_KEY_STORAGE_KEY = 'sleuther_hive_secret_key';

interface ApiKeyContextType {
    googleApiKey: string | null;
    hiveAccessKey: string | null;
    hiveSecretKey: string | null;
    hasGoogleApiKey: boolean;
    hasHiveKeys: boolean;
    saveGoogleApiKey: (key: string) => void;
    saveHiveKeys: (accessKey: string, secretKey: string) => void;
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

    const [hiveAccessKey, setHiveAccessKey] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(HIVE_ACCESS_KEY_STORAGE_KEY);
        }
        return null;
    });

    const [hiveSecretKey, setHiveSecretKey] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(HIVE_SECRET_KEY_STORAGE_KEY);
        }
        return null;
    });

    const clearKeys = useCallback(() => {
        localStorage.removeItem(GOOGLE_API_KEY_STORAGE_KEY);
        localStorage.removeItem(HIVE_ACCESS_KEY_STORAGE_KEY);
        localStorage.removeItem(HIVE_SECRET_KEY_STORAGE_KEY);
        setGoogleApiKey((process.env.GEMINI_API_KEY as string) || null);
        setHiveAccessKey(null);
        setHiveSecretKey(null);
    }, []);

    const saveGoogleApiKey = useCallback((key: string) => {
        if (key) {
            localStorage.setItem(GOOGLE_API_KEY_STORAGE_KEY, key);
        } else {
            localStorage.removeItem(GOOGLE_API_KEY_STORAGE_KEY);
        }
        setGoogleApiKey(key || (process.env.GEMINI_API_KEY as string) || null);
    }, []);

    const saveHiveKeys = useCallback((accessKey: string, secretKey: string) => {
        if (accessKey && secretKey) {
            localStorage.setItem(HIVE_ACCESS_KEY_STORAGE_KEY, accessKey);
            localStorage.setItem(HIVE_SECRET_KEY_STORAGE_KEY, secretKey);
        } else {
            localStorage.removeItem(HIVE_ACCESS_KEY_STORAGE_KEY);
            localStorage.removeItem(HIVE_SECRET_KEY_STORAGE_KEY);
        }
        setHiveAccessKey(accessKey || null);
        setHiveSecretKey(secretKey || null);
    }, []);

    const value = {
        googleApiKey,
        hiveAccessKey,
        hiveSecretKey,
        hasGoogleApiKey: !!googleApiKey,
        hasHiveKeys: !!hiveAccessKey && !!hiveSecretKey,
        saveGoogleApiKey,
        saveHiveKeys,
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
