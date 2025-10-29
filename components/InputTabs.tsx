import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { TextIcon } from './icons/TextIcon';
import { LinkIcon } from './icons/LinkIcon';
import { XMarkIcon } from './icons/XMarkIcon';

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

export const InputTabs: React.FC<InputTabsProps> = ({ onTextChange, onFilesChange, onClearFiles, onUrlChange, textContent, fileNames, imageData, url, isUrlValid = true }) => {
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
          Analyze URL
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
           imageData && imageData.length > 0 ? (
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
           ) : unsupportedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 p-4 bg-red-100 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-500/50 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-400 dark:hover:border-red-500 transition-colors duration-300"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, .txt,.md,.html,.js,.py,.java,.c,.cpp,.cs" multiple />
              <UploadIcon className="w-8 h-8 text-red-500 dark:text-red-400 mb-2" />
              <p className="font-semibold text-slate-800 dark:text-white break-all px-2">{unsupportedFile}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Zis file type is most peculiar! I cannot analyze it.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please provide an image or text file, non?</p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 transition-colors duration-300"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, .txt,.md,.html,.js,.py,.java,.c,.cpp,.cs" multiple />
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
          )
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
};