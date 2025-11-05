import React, { useState, useEffect } from 'react';
import { base64ToBlobUrl } from '../utils/fileUtils';
import { SpinnerIcon } from './icons/index';

interface EvidenceImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  base64Src: string;
}

export const EvidenceImage: React.FC<EvidenceImageProps> = ({ base64Src, alt, ...props }) => {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This effect runs when the component mounts and whenever base64Src changes.
        let isMounted = true;
        let tempUrl: string | null = null;

        const processImage = () => {
            if (!base64Src) {
                if(isMounted) {
                    setError("No image source provided.");
                    setIsLoading(false);
                }
                return;
            }

            try {
                // Synchronously create the blob URL
                tempUrl = base64ToBlobUrl(base64Src);
                if (isMounted) {
                    setObjectUrl(tempUrl);
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to create object URL:", err);
                if (isMounted) {
                    setError("Preview failed to load.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        setIsLoading(true);
        processImage();

        // Cleanup function
        return () => {
            isMounted = false;
            if (tempUrl) {
                URL.revokeObjectURL(tempUrl);
            }
        };
    }, [base64Src]); // Dependency array ensures this runs only when the image source changes.

    if (isLoading) {
        return (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <SpinnerIcon className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
        );
    }
    
    if (error || !objectUrl) {
        return (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center p-2">
                <p className="text-xs text-red-500 text-center">{error || "Preview Error"}</p>
            </div>
        );
    }

    return (
        <img
            src={objectUrl}
            alt={alt}
            {...props}
        />
    );
};
