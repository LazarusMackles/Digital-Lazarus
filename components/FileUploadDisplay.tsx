
import React, { useCallback, useState, useRef } from 'react';
import { Icon } from './icons/index';
import { compressAndEncodeFile } from '../utils/imageCompression';
import { useInputState } from '../context/InputStateContext';
import { useUIState } from '../context/UIStateContext';
import * as actions from '../context/actions';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ACCEPTED_IMAGE_TYPES, ACCEPTED_IMAGE_TYPES_STRING } from '../utils/constants';
import { EvidenceImage } from './ui';
import { cn } from '../utils/cn';

export const FileUploadDisplay: React.FC = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: uiDispatch } = useUIState();
    const { fileData } = inputState;

    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File | null) => {
        if (!file) return;

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE_BYTES) {
            uiDispatch({ type: actions.SET_ERROR, payload: `Please upload a PNG, JPG, WEBP, or GIF image under ${MAX_FILE_SIZE_MB}MB.` });
            return;
        }

        try {
            const imageBase64 = await compressAndEncodeFile(file);
            const newFileData = { name: file.name, imageBase64 };
            inputDispatch({ type: actions.SET_FILE_DATA, payload: newFileData });
        } catch (error) {
            console.error("Error processing file:", error);
            uiDispatch({ type: actions.SET_ERROR, payload: 'Failed to process the image.' });
        }
    }, [inputDispatch, uiDispatch]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFile(event.target.files?.[0] || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
        processFile(event.dataTransfer.files?.[0] || null);
    };

    const handleDragEvent = (event: React.DragEvent<HTMLDivElement>, active: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(active);
    };

    const handleRemoveFile = () => {
        inputDispatch({ type: actions.SET_FILE_DATA, payload: null });
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col gap-4">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept={ACCEPTED_IMAGE_TYPES_STRING}
                className="hidden"
            />
            <div
                onDrop={handleDrop}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                className={cn(
                    'relative p-4 border-2 border-dashed rounded-lg transition-colors min-h-[220px] max-w-sm mx-auto',
                    'flex flex-col items-center justify-center w-full',
                    isDragActive 
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30' 
                        : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900'
                )}
            >
                {!fileData ? (
                     <div onClick={triggerFileSelect} className="text-center cursor-pointer">
                        <Icon name="upload" className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                           <span className="font-semibold text-cyan-600 dark:text-cyan-400">Drag & drop an image here,</span> or click to select.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">(PNG, JPG, WEBP, GIF)</p>
                    </div>
                ) : (
                    <div className="relative group w-full h-full max-w-[180px] aspect-square bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                        {fileData.imageBase64 && <EvidenceImage base64Src={fileData.imageBase64} alt={`Preview of ${fileData.name}`} className="w-full h-full object-cover" />}
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm text-center">
                            <p className="text-xs text-white truncate">{fileData.name}</p>
                        </div>
                        <button onClick={handleRemoveFile} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all" aria-label={`Remove ${fileData.name}`}>
                            <Icon name="x-mark" className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
