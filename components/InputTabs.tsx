
import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import type { InputType } from '../types';
import { TextIcon, UploadIcon, LinkIcon } from './icons/index';

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-t-lg transition-colors duration-200 border-b-4 ${
        isActive
          ? 'bg-white dark:bg-slate-800 border-cyan-500'
          : 'bg-slate-100 dark:bg-slate-900/50 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800/80'
      }`}
      aria-selected={isActive}
      role="tab"
    >
      {icon}
      <span className={`mt-2 text-sm font-semibold ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'}`}>
        {label}
      </span>
    </button>
  );
};

export const InputTabs: React.FC = React.memo(() => {
  const { activeInput, dispatch } = useAnalysis();

  const handleTabChange = (inputType: InputType) => {
    dispatch({ type: 'SET_ACTIVE_INPUT', payload: inputType });
  };

  return (
    <div className="flex" role="tablist">
      <TabButton
        label="Text"
        icon={<TextIcon className="w-6 h-6" />}
        isActive={activeInput === 'text'}
        onClick={() => handleTabChange('text')}
      />
      <TabButton
        label="File(s)"
        icon={<UploadIcon className="w-6 h-6" />}
        isActive={activeInput === 'file'}
        onClick={() => handleTabChange('file')}
      />
      <TabButton
        label="URL"
        icon={<LinkIcon className="w-6 h-6" />}
        isActive={activeInput === 'url'}
        onClick={() => handleTabChange('url')}
      />
    </div>
  );
});
