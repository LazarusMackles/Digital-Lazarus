import { useState, useEffect, useCallback } from 'react';

// Define the AIStudio interface to provide type safety for the global window object.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}


export const useApiKey = () => {
    const [hasApiKey, setHasApiKey] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    const checkApiKey = useCallback(async () => {
        setIsChecking(true);
        if (window.aistudio) {
            try {
                const keyStatus = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(keyStatus);
            } catch (e) {
                console.error("Error checking for API key:", e);
                setHasApiKey(false);
            }
        } else {
            // If aistudio isn't available, assume no key for safety.
            setHasApiKey(false);
        }
        setIsChecking(false);
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const selectApiKey = useCallback(async () => {
        if (window.aistudio) {
            try {
                await window.aistudio.openSelectKey();
                // Optimistically update UI and then re-verify silently.
                setHasApiKey(true);
                await checkApiKey();
            } catch (e) {
                console.error("Error opening select key dialog:", e);
                // If it fails, re-check to get the actual state.
                await checkApiKey();
            }
        }
    }, [checkApiKey]);

    return { hasApiKey, isChecking, selectApiKey, recheckApiKey: checkApiKey };
};
