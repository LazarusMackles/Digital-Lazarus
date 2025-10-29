import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { TextIcon } from './icons/TextIcon';
import { LinkIcon } from './icons/LinkIcon';

interface InputTabsProps {
  onTextChange: (text: string) => void;
  onFileChange: (fileName: string, content: string | null, imageBase64: string | null) => void;
  onUrlChange: (url: string) => void;
  textContent: string;
  fileName: string | null;
  imageData: string | null;
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

export const InputTabs: React.FC<InputTabsProps> = ({ onTextChange, onFileChange, onUrlChange, textContent, fileName, imageData, url, isUrlValid = true }) => {
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [unsupportedFile, setUnsupportedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    setUnsupportedFile(null);
    if (file) {
      const reader = new FileReader();
      const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const supportedTextExtensions = ['.txt', '.md', '.html', '.js', '.py', '.java', '.c', '.cpp', '.cs'];

      if (supportedImageTypes.includes(file.type)) {
        reader.onload = (e) => {
          const imageBase64 = e.target?.result as string;
          onFileChange(file.name, null, imageBase64);
          setActiveTab('file');
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('text/') || supportedTextExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileChange(file.name, content, null);
          setActiveTab('file');
        };
        reader.readAsText(file);
      } else {
        setUnsupportedFile(file.name);
        onFileChange(file.name, null, null); // Clear content in parent
        setActiveTab('file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
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
          Upload File
        </TabButton>
        <TabButton active={activeTab === 'url'} onClick={() => selectTab('url')}>
          <LinkIcon className="w-5 h-5" />
          Analyze URL
        </TabButton>
      </div>

      <div className="mt-6">
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
          imageData ? (
            <div className="w-full h-48 relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
              <img src={imageData} alt={fileName || 'Uploaded preview'} className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <p className="text-white font-semibold text-center break-all px-4">{fileName}<span className="block text-sm font-normal text-slate-300 mt-1">Click to change</span></p>
              </div>
            </div>
          ) : unsupportedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 p-4 bg-red-100 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-500/50 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-400 dark:hover:border-red-500 transition-colors duration-300"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp, .txt,.md,.html,.js,.py,.java,.c,.cpp,.cs"
              />
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp, .txt,.md,.html,.js,.py,.java,.c,.cpp,.cs"
              />
              <UploadIcon className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
              {fileName && !imageData ? (
                <p className="text-slate-800 dark:text-white font-medium">{fileName}</p>
              ) : (
                <>
                  <p className="font-semibold text-slate-800 dark:text-white">Submit digital artifacts for inspection</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">A photograph? A manuscript? All are welcome.</p>
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