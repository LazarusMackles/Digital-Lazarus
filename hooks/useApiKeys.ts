
import { useContext } from 'react';
// FIX: Imported the now-exported ApiKeyContext to resolve the module error.
import { ApiKeyContext } from '../context/ApiKeyContext';

// This hook is a simple alias for useContext to provide a cleaner API.
// The actual context is defined in ApiKeyContext.tsx to avoid circular dependencies.
export const useApiKeys = () => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKeys must be used within an ApiKeyProvider');
    }
    return context;
};
