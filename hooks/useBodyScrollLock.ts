import { useEffect } from 'react';

export const useBodyScrollLock = () => {
    useEffect(() => {
        // Get original body overflow style to restore it later
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        
        // Re-enable scrolling when component unmounts
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []); // Empty array ensures effect is only run on mount and unmount
};
