import React from 'react';
import { XMarkIcon, UploadIcon } from './icons';

interface FileUploadDisplayProps {
    imageData: string[] | null;
    unsupportedFile: string | null;
    fileNames: string[] | null;
    onClearFiles: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUploadDisplay: React.FC<FileUploadDisplayProps> = React.memo(({
    imageData,
    unsupportedFile,
    fileNames,
    onClearFiles,
    onFileChange,
    fileInputRef
}) => {
    if (imageData && imageData.length > 0) {
        return (
            <div className="relative group">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {imageData.map((src, index) => (
                        <div key={index} className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                            <img src={src} alt={`Uploaded preview ${index + 1}`} className="w-full h-full object-contain" />
                            {index === 0 && (
                                <div className="absolute top-1 left-1 bg-cyan-600 text-white text-xs font-bold px-2 py-0.5 rounded">PRIMARY</div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 bg-black/70 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer flex rounded-lg" onClick={onClearFiles}>
                    <XMarkIcon className="w-10 h-10 text-white bg-slate-800/50 rounded-full p-2" />
                    <p className="mt-2 text-white font-semibold text-center break-all px-4">Clear and upload new file(s)</p>
                </div>
            </div>
        );
    }

    if (unsupportedFile) {
        return (
            <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 p-4 bg-red-100 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-500/50 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-400 dark:hover:border-red-500 transition-colors duration-300"
            >
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, .txt,.md,.html,.js,.py,.java,.c,.cpp,.cs" multiple />
                <UploadIcon className="w-8 h-8 text-red-500 dark:text-red-400 mb-2" />
                <p className="font-semibold text-slate-800 dark:text-white break-all px-2">{unsupportedFile}</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">Zis file type is most peculiar! I cannot analyse it.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please provide an image or text file, non?</p>
            </div>
        );
    }

    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 transition-colors duration-300"
        >
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, .txt,.md,.html,.js,.py,.java,.c,.cpp,.cs" multiple />
            <UploadIcon className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
            {fileNames && fileNames.length > 0 && !imageData ? (
                <p className="text-slate-800 dark:text-white font-medium">{fileNames.join(', ')}</p>
            ) : (
                <>
                    <p className="font-semibold text-slate-800 dark:text-white">Submit digital artifacts for inspection</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Upload multiple images for detailed analysis.</p>
                </>
            )}
        </div>
    );
});
