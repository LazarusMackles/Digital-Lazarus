import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { XMarkIcon, UploadIcon } from './icons/index';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Helper to convert Base64 Data URL to a Blob
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
}

// Component Version: 2024-05-11-BLOB-URL-FIX

export const FileUploadDisplay: React.FC = () => {
    const { fileData, dispatch } = useAnalysis();
    const [isDragActive, setIsDragActive] = useState(false);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to create and manage Blob URLs for previews
    useEffect(() => {
        // Function to create blob URLs from fileData
        const createPreviews = async () => {
            if (fileData && fileData.length > 0) {
                const urls = await Promise.all(
                    fileData.map(async (file) => {
                        if (file.imageBase64) {
                            try {
                                const blob = await dataUrlToBlob(file.imageBase64);
                                return URL.createObjectURL(blob);
                            } catch (e) {
                                console.error("Failed to create blob from data URL", e);
                                return ''; // return an empty string or a placeholder URL on failure
                            }
                        }
                        return '';
                    })
                );
                setImagePreviewUrls(urls.filter(Boolean));
            } else {
                setImagePreviewUrls([]);
            }
        };

        createPreviews();

        // Cleanup function to revoke Blob URLs on component unmount or when fileData changes
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileData]);


    const processFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const currentFileCount = fileData.length;
        if (currentFileCount + files.length > 4) {
            dispatch({ type: 'ANALYSIS_ERROR', payload: 'You can upload a maximum of 4 images.' });
            return;
        }

        try {
            const acceptedFiles = Array.from(files).filter(file => 
                ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) && file.size <= 10 * 1024 * 1024
            );
            
            if (acceptedFiles.length !== files.length) {
                 dispatch({ type: 'ANALYSIS_ERROR', payload: 'Some files were rejected. Ensure images are PNG, JPG, WEBP, or GIF and under 10MB.' });
            }
            
            if (acceptedFiles.length === 0) return;

            const newFilesData = await Promise.all(
                acceptedFiles.map(async (file) => {
                    const imageBase64 = await fileToBase64(file);
                    return { name: file.name, imageBase64 };
                })
            );
            
            const combinedFiles = [...fileData, ...newFilesData].slice(0, 4);
            dispatch({ type: 'SET_FILE_DATA', payload: combinedFiles });

        } catch (error) {
            console.error("Error processing files:", error);
            dispatch({ type: 'ANALYSIS_ERROR', payload: 'Failed to process one or more images.' });
        }
    }, [dispatch, fileData]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
        processFiles(event.dataTransfer.files);
    };

    const handleDragEvent = (event: React.DragEvent<HTMLDivElement>, active: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(active);
    };

    const handleRemoveFile = (fileName: string) => {
        const newFileData = fileData.filter(file => file.name !== fileName);
        dispatch({ type: 'SET_FILE_DATA', payload: newFileData });
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col gap-4">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
            />
            <div
                onDrop={handleDrop}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                className={`relative p-4 border-2 border-dashed rounded-lg transition-colors min-h-[180px]
                    ${isDragActive ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30' : 'border-slate-300 dark:border-slate-600'}
                `}
            >
                {fileData.length === 0 && (
                     <div onClick={triggerFileSelect} className="flex flex-col items-center justify-center h-full text-center cursor-pointer">
                        <UploadIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                           <span className="font-semibold text-cyan-600 dark:text-cyan-400">Drag & drop images here,</span> or click to select files
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">(Up to 4 images: PNG, JPG, WEBP, GIF)</p>
                    </div>
                )}
                
                {fileData.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
                            Evidence Queue ({fileData.length}/4):
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             {fileData.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="relative group aspect-square bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                                    {imagePreviewUrls[index] && (
                                        <img
                                            src={imagePreviewUrls[index]}
                                            alt={`Preview of ${file.name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm text-center">
                                        <p className="text-xs text-white truncate">{file.name}</p>
                                    </div>
                                    <button onClick={() => handleRemoveFile(file.name)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all" aria-label={`Remove ${file.name}`}>
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {fileData.length < 4 && (
                                <button onClick={triggerFileSelect} className="flex flex-col items-center justify-center aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                                    <UploadIcon className="w-8 h-8" />
                                    <span className="text-xs mt-2">Add more</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};