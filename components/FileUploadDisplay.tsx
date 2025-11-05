import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/index';

interface FileUploadDisplayProps {
  onFilesChange: (files: { name: string; imageBase64?: string | null; content?: string | null }[]) => void;
  onClearFiles: () => void;
  fileNames: string[] | null;
  imageData: string[] | null;
}

const MAX_FILES = 4;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_TEXT_TYPES = ['text/plain', 'text/markdown'];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const FileUploadDisplay: React.FC<FileUploadDisplayProps> = React.memo(({ onFilesChange, onClearFiles, fileNames, imageData }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFiles = useCallback(async (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) return;

      if (files.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} files.`);
        return;
      }

      const processedFiles: { name: string; imageBase64?: string | null; content?: string | null }[] = [];
      let hasTextFile = false;

      for (const file of Array.from(files)) {
        if (file.size > MAX_SIZE_BYTES) {
          setError(`File "${file.name}" is too large (max ${MAX_SIZE_MB}MB).`);
          return;
        }

        if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
          const base64 = await fileToBase64(file);
          processedFiles.push({ name: file.name, imageBase64: base64 });
        } else if (SUPPORTED_TEXT_TYPES.includes(file.type)) {
          if (hasTextFile) {
            setError("You can only upload one text file at a time.");
            return;
          }
          const textContent = await fileToText(file);
          processedFiles.push({ name: file.name, content: textContent });
          hasTextFile = true;
        } else {
           setError(`File type for "${file.name}" is not supported. Please use images or plain text files.`);
           return;
        }
      }

      onFilesChange(processedFiles);

    }, [onFilesChange]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    if (fileNames && fileNames.length > 0) {
        return (
            <div className="animate-fade-in text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg">
                    <h4 className="font-semibold text-slate-800 dark:text-white">Evidence Submitted:</h4>
                    <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {fileNames.map((name, index) => <li key={index}>{name}</li>)}
                    </ul>
                </div>
                <button onClick={onClearFiles} className="mt-4 text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                    Clear Evidence and Start Over
                </button>
            </div>
        )
    }

    return (
        <div>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${
                isDragging ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
                <input
                    type="file"
                    multiple
                    accept={[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_TEXT_TYPES].join(',')}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <UploadIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">
                        Drag & drop files or <span className="text-cyan-600 dark:text-cyan-400">click to browse</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Images (JPG, PNG) or text files. Up to {MAX_FILES} files, {MAX_SIZE_MB}MB each.
                    </p>
                </label>
            </div>
            {error && <p aria-live="polite" className="mt-2 text-center text-red-500 text-sm">{error}</p>}
        </div>
    );
});
