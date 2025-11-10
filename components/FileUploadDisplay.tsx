import React, { useCallback, useState, useRef } from 'react';
import { Icon } from './icons/index';
import { compressAndEncodeFile } from '../utils/imageCompression';
import { useInputState } from '../context/InputStateContext';
import { useResultState } from '../context/ResultStateContext';
import * as actions from '../context/actions';
import { MAX_FILES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ACCEPTED_IMAGE_TYPES, ACCEPTED_IMAGE_TYPES_STRING } from '../utils/constants';
import { Button, EvidenceImage } from './ui';
import { cn } from '../utils/cn';

export const FileUploadDisplay: React.FC = () => {
    const { state: inputState, dispatch: inputDispatch } = useInputState();
    const { dispatch: resultDispatch } = useResultState();
    const { fileData } = inputState;

    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const currentFileCount = fileData.length;
        if (currentFileCount + files.length > MAX_FILES) {
            resultDispatch({ type: actions.ANALYSIS_ERROR, payload: `You can upload a maximum of ${MAX_FILES} images.` });
            return;
        }

        try {
            const acceptedFiles = Array.from(files).filter(file => 
                ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_BYTES
            );
            
            if (acceptedFiles.length !== files.length) {
                 resultDispatch({ type: actions.ANALYSIS_ERROR, payload: `Some files were rejected. Ensure images are PNG, JPG, WEBP, or GIF and under ${MAX_FILE_SIZE_MB}MB.` });
            }
            
            if (acceptedFiles.length === 0) return;

            const newFilesData = await Promise.all(
                acceptedFiles.map(async (file) => {
                    const imageBase64 = await compressAndEncodeFile(file);
                    return { name: file.name, imageBase64 };
                })
            );
            
            const combinedFiles = [...fileData, ...newFilesData].slice(0, MAX_FILES);
            inputDispatch({ type: actions.SET_FILE_DATA, payload: combinedFiles });

        } catch (error) {
            console.error("Error processing files:", error);
            resultDispatch({ type: actions.ANALYSIS_ERROR, payload: 'Failed to process one or more images.' });
        }
    }, [inputDispatch, resultDispatch, fileData]);
    
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
        inputDispatch({ type: actions.SET_FILE_DATA, payload: newFileData });
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col gap-4">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept={ACCEPTED_IMAGE_TYPES_STRING}
                multiple
                className="hidden"
            />
            <div
                onDrop={handleDrop}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                className={cn(
                    'relative p-4 border-2 border-dashed rounded-lg transition-colors min-h-[180px]',
                    isDragActive 
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30' 
                        : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900',
                    { 'flex flex-col items-center justify-center': fileData.length === 0 }
                )}
            >
                {fileData.length === 0 && (
                     <div onClick={triggerFileSelect} className="text-center cursor-pointer">
                        <Icon name="upload" className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                           <span className="font-semibold text-cyan-600 dark:text-cyan-400">Drag & drop images here,</span> or click to select files.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">(Up to {MAX_FILES} images: PNG, JPG, WEBP, GIF)</p>
                    </div>
                )}
                
                {fileData.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
                            Evidence Queue ({fileData.length}/{MAX_FILES}):
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             {fileData.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="relative group aspect-square bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                                    {file.imageBase64 && <EvidenceImage base64Src={file.imageBase64} alt={`Preview of ${file.name}`} className="w-full h-full object-cover" />}
                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm text-center">
                                        <p className="text-xs text-white truncate">{file.name}</p>

                                    </div>
                                    <button onClick={() => handleRemoveFile(file.name)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all" aria-label={`Remove ${file.name}`}>
                                        <Icon name="x-mark" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {fileData.length < MAX_FILES && (
                                <Button type="button" onClick={triggerFileSelect} variant="add">
                                    <Icon name="upload" className="w-8 h-8" />
                                    <span className="text-xs mt-2">Add more</span>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
