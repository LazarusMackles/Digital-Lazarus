
import React from 'react';
import type { InputType } from '../types';
import { TextIcon, UploadIcon, LinkIcon } from './icons/index';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  // By cloning the icon, we can dynamically add color classes
  // that are theme-aware and state-aware (active/inactive), fixing the light mode visibility issue.
  const iconWithClass = React.cloneElement(icon as React.ReactElement, {
    className: `${(icon as React.ReactElement).props.className} transition-colors duration-200 ${
        isActive 
          ? 'text-cyan-600 dark:text-cyan-400' 
          // A neutral, visible color for inactive icons in both light and dark mode.
          : 'text-slate-500 dark:text-slate-400'
    }`
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-t-lg transition-colors duration-200 border-b-4 ${
        isActive
          ? 'bg-white dark:bg-slate-800 border-cyan-500'
          : 'bg-slate-100 dark:bg-slate-900/50 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800/80'
      }`}
      aria-selected={isActive}
      role="tab"
    >
      {iconWithClass}
      <span className={`mt-2 text-base font-semibold ${
        isActive 
          ? 'text-cyan-600 dark:text-cyan-400' 
          : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500'
      }`}>
        {label}
      </span>
    </button>
  );
};

export const InputTabs: React.FC = React.memo(() => {
  const { state, dispatch } = useInputState();
  const { activeInput } = state;

  const handleTabChange = (inputType: InputType) => {
    dispatch({ type: actions.SET_ACTIVE_INPUT, payload: inputType });
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
