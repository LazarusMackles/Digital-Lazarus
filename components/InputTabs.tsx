import React, { useRef, useState } from 'react';
import { UploadIcon, TextIcon, LinkIcon } from './icons';
import { FileUploadDisplay } from './FileUploadDisplay';
import type { InputType } from '../types';

interface InputTabsProps {
  onTextChange: (text: string) => void;
  onFilesChange: (files: { name: string, content?: string | null, imageBase64?: string | null }[]) => void;
  onClearFiles: () => void;
  onUrlChange: (url: string) => void;
  textContent: string;
  fileNames: string[] | null;
  imageData: string[] | null;
  url: string;
  isUrlValid?: boolean;
  activeInput: InputType;
  setActiveInput: (type: InputType) => void;
  onUseExampleText: () => void;
  onUseExampleImage: () => void;
  onUseExampleUrl: () => void;
}

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => {
  const commonClasses = 'flex-1 px-4 py-3 text-lg rounded-t-lg transition-all duration-300 flex items-center justify-center gap-2';

  if (active) {
    return (
      <button onClick={onClick} className={`${commonClasses} bg-black dark:bg-slate-700 text-white font-semibold`}>
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  // Inactive state emulating the 'How It Works' style
  return (
    <button
      onClick={onClick}
      className={`${commonClasses} bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800`}
    >
      <span className="text-cyan-600 dark:text-cyan-400">{icon}</span>
      <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">
        {label}
      </span>
    </button>
  );
};


export const InputTabs: React.FC<InputTabsProps> = React.memo(({ onTextChange, onFilesChange, onClearFiles, onUrlChange, textContent, fileNames, imageData, url, isUrlValid = true, activeInput, setActiveInput, onUseExampleText, onUseExampleImage, onUseExampleUrl }) => {
  const [unsupportedFile, setUnsupportedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePromises = (files: File[]) => {
    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const supportedTextExtensions = ['.txt', '.md', '.html', '.js', '.py', '.java', '.c', '.cpp', '.cs'];

    if (files.length > 1 && !files.every(f => supportedImageTypes.includes(f.type))) {
      setUnsupportedFile('For multi-file uploads, please select only images (jpg, png, webp).');
      onFilesChange([]);
      return;
    }
    
    setUnsupportedFile(null);

    const promises = files.map(file => {
      return new Promise<{ name: string, content?: string | null, imageBase64?: string | null }>((resolve) => {
        const reader = new FileReader();

        if (supportedImageTypes.includes(file.type)) {
          reader.onload = (e) => resolve({ name: file.name, imageBase64: e.target?.result as string });
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('text/') || supportedTextExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
          reader.onload = (e) => resolve({ name: file.name, content: e.target?.result as string });
          reader.readAsText(file);
        } else {
          setUnsupportedFile(file.name);
          resolve({ name: file.name }); // Resolve with just the name for unsupported type
        }
      });
    });

    Promise.all(promises).then(results => {
      const allFilesSupported = results.every(r => r.imageBase64 || r.content);
      if(allFilesSupported) {
          onFilesChange(results);
      } else {
          onFilesChange(results.filter(r => r.imageBase64 || r.content));
      }
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilePromises(Array.from(e.target.files));
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilePromises(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleTabClick = (tab: InputType) => {
    setUnsupportedFile(null);
    setActiveInput(tab);
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="flex border-b border-slate-300 dark:border-slate-700">
        <TabButton 
            active={activeInput === 'text'} 
            onClick={() => handleTabClick('text')}
            icon={<TextIcon className="w-5 h-5" />}
            label="Paste Text"
        />
        <TabButton 
            active={activeInput === 'file'} 
            onClick={() => handleTabClick('file')}
            icon={<UploadIcon className="w-5 h-5" />}
            label="Upload File(s)"
        />
        <TabButton 
            active={activeInput === 'url'} 
            onClick={() => handleTabClick('url')}
            icon={<LinkIcon className="w-5 h-5" />}
            label="Analyse URL"
        />
      </div>

      <div className="mt-6 min-h-[12rem] flex flex-col justify-center">
        {activeInput === 'text' && (
          <div>
            <textarea
              value={textContent}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Present the textual evidence here ... I am examining every character."
              className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors duration-300 resize-none"
              maxLength={15000}
            />
            {textContent.trim() === '' && (
              <div className="text-center mt-3">
                <button 
                  onClick={onUseExampleText}
                  className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                    Use an Example Text
                </button>
              </div>
            )}
          </div>
        )}
        {activeInput === 'file' && (
           <FileUploadDisplay 
             imageData={imageData}
             unsupportedFile={unsupportedFile}
             fileNames={fileNames}
             onClearFiles={onClearFiles}
             onFileChange={handleFileChange}
             fileInputRef={fileInputRef}
             onUseExample={onUseExampleImage}
           />
        )}
        {activeInput === 'url' && (
            <div>
              <input
                  type="text"
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="Provide the web address of the scene ... I shall investigate."
                  className={`w-full h-14 px-4 bg-slate-100 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-300 ${
                    isUrlValid ? 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500' : 'border-red-500 dark:border-red-500/80 ring-1 ring-red-500 focus:ring-red-500'
                  }`}
              />
              {url.trim() === '' && (
                <div className="text-center mt-3">
                  <button 
                    onClick={onUseExampleUrl}
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                      Use an Example URL
                  </button>
                </div>
              )}
              {!isUrlValid && url.trim() !== '' && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">Mon Dieu! That does not appear to be a valid web address.</p>
              )}
            </div>
        )}
      </div>
    </div>
  );
});