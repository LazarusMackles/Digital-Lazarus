import React, { useState, useRef } from 'react';
import { UploadIcon, TextIcon, LinkIcon } from './icons';
import { FileUploadDisplay } from './FileUploadDisplay';

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
}

type InputType = 'text' | 'file' | 'url';

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm sm:text-base font-semibold rounded-t-lg transition-all duration-300 flex items-center justify-center gap-2 border-b-2 ${
        active
          ? 'text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  );
};

export const InputTabs: React.FC<InputTabsProps> = React.memo(({ onTextChange, onFilesChange, onClearFiles, onUrlChange, textContent, fileNames, imageData, url, isUrlValid = true }) => {
  const [activeTab, setActiveTab] = useState<InputType>('text');
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
          setActiveTab('file');
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

  const selectTab = (tab: InputType) => {
    setActiveTab(tab);
    setUnsupportedFile(null); // Reset when changing tabs
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="flex border-b border-slate-300 dark:border-slate-700">
        <TabButton active={activeTab === 'text'} onClick={() => selectTab('text')}>
          <TextIcon className="w-5 h-5" />
          Paste Text
        </TabButton>
        <TabButton active={activeTab === 'file'} onClick={() => selectTab('file')}>
          <UploadIcon className="w-5 h-5" />
          Upload File(s)
        </TabButton>
        <TabButton active={activeTab === 'url'} onClick={() => selectTab('url')}>
          <LinkIcon className="w-5 h-5" />
          Analyse URL
        </TabButton>
      </div>

      <div className="mt-6 min-h-[12rem] flex flex-col justify-center">
        {activeTab === 'text' && (
          <textarea
            value={textContent}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Present the textual evidence here... I am examining every character."
            className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors duration-300 resize-none"
            maxLength={15000}
          />
        )}
        {activeTab === 'file' && (
           <FileUploadDisplay 
             imageData={imageData}
             unsupportedFile={unsupportedFile}
             fileNames={fileNames}
             onClearFiles={onClearFiles}
             onFileChange={handleFileChange}
             fileInputRef={fileInputRef}
           />
        )}
        {activeTab === 'url' && (
            <div>
              <input
                  type="text"
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="Provide the web address of the scene... I shall investigate."
                  className={`w-full h-14 px-4 bg-slate-100 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-300 ${
                    isUrlValid ? 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500' : 'border-red-500 dark:border-red-500/80 ring-1 ring-red-500 focus:ring-red-500'
                  }`}
              />
              {!isUrlValid && url.trim() !== '' && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">Mon Dieu! That does not appear to be a valid web address.</p>
              )}
            </div>
        )}
      </div>
    </div>
  );
});
