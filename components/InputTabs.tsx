import React from 'react';
import type { InputType } from '../types';
import { TextIcon, UploadIcon, LinkIcon } from './icons/index';
import { FileUploadDisplay } from './FileUploadDisplay';

interface InputTabsProps {
  onTextChange: (text: string) => void;
  onFilesChange: (files: { name: string; imageBase64?: string | null; content?: string | null }[]) => void;
  onClearFiles: () => void;
  onUrlChange: (url: string) => void;
  textContent: string;
  fileNames: string[] | null;
  imageData: string[] | null;
  url: string;
  isUrlValid: boolean;
  activeInput: InputType;
  setActiveInput: (type: InputType) => void;
}

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    className={`flex-1 flex items-center justify-center gap-2 p-3 sm:p-4 text-sm font-bold border-b-4 transition-all duration-200 ${
      isActive
        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);


export const InputTabs: React.FC<InputTabsProps> = React.memo((
    {
        onTextChange,
        onFilesChange,
        onClearFiles,
        onUrlChange,
        textContent,
        fileNames,
        imageData,
        url,
        isUrlValid,
        activeInput,
        setActiveInput,
    }
) => {
  return (
    <div id="input-area" className="mb-6">
      <div className="flex border-b border-slate-200 dark:border-slate-700" role="tablist">
        <TabButton
            label="Text"
            icon={<TextIcon className="w-6 h-6" />}
            isActive={activeInput === 'text'}
            onClick={() => setActiveInput('text')}
        />
        <TabButton
            label="File(s)"
            icon={<UploadIcon className="w-6 h-6" />}
            isActive={activeInput === 'file'}
            onClick={() => setActiveInput('file')}
        />
        <TabButton
            label="URL"
            icon={<LinkIcon className="w-6 h-6" />}
            isActive={activeInput === 'url'}
            onClick={() => setActiveInput('url')}
        />
      </div>

      <div className="pt-6">
        {activeInput === 'text' && (
           <div role="tabpanel" className="animate-fade-in">
              <textarea
                value={textContent}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Paste the text you want to analyze here. For best results, provide at least a few paragraphs..."
                className="w-full h-48 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base resize-y focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200"
              />
           </div>
        )}
        {activeInput === 'file' && (
           <div role="tabpanel" className="animate-fade-in">
             <FileUploadDisplay
                onFilesChange={onFilesChange}
                onClearFiles={onClearFiles}
                fileNames={fileNames}
                imageData={imageData}
             />
           </div>
        )}
        {activeInput === 'url' && (
           <div role="tabpanel" className="animate-fade-in">
             <input
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com/article-to-analyze"
                className={`w-full p-4 bg-slate-100 dark:bg-slate-900 border ${
                  isUrlValid ? 'border-slate-300 dark:border-slate-700' : 'border-red-500'
                } rounded-lg text-base focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-800 dark:text-slate-200`}
             />
             {!isUrlValid && url && <p className="text-red-500 text-sm mt-2">Please enter a valid URL.</p>}
           </div>
        )}
      </div>
    </div>
  );
});
