

import React from 'react';
import type { InputType } from '../types';
import { Icon } from './icons/index';
import { useInputState } from '../context/InputStateContext';
import * as actions from '../context/actions';
import { cn } from '../utils/cn';

const TabButton: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center justify-center p-4 rounded-t-lg transition-colors duration-200 border-b-4',
        {
          'bg-white dark:bg-slate-800 border-cyan-500': isActive,
          'bg-slate-100 dark:bg-slate-900/50 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800/80': !isActive,
        }
      )}
      aria-selected={isActive}
      role="tab"
    >
      <Icon
        name={icon}
        className={cn(
          'w-6 h-6 transition-colors duration-200',
          {
            'text-cyan-600 dark:text-cyan-400': isActive,
            'text-slate-500 dark:text-slate-400': !isActive,
          }
        )}
      />
      <span className={cn(
        'mt-2 text-base font-semibold',
        {
          'text-cyan-600 dark:text-cyan-400': isActive,
          'text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500': !isActive,
        }
      )}>
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
        label="File(s)"
        icon="upload"
        isActive={activeInput === 'file'}
        onClick={() => handleTabChange('file')}
      />
      <TabButton
        label="Text"
        icon="text"
        isActive={activeInput === 'text'}
        onClick={() => handleTabChange('text')}
      />
    </div>
  );
});