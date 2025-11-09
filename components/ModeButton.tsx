import React from 'react';
import { cn } from '../utils/cn';

interface ModeButtonProps {
    active: boolean;
    onClick: () => void;
    title: string;
    description: string;
    size?: 'md' | 'sm';
    titleStyle?: 'default' | 'gradient';
}

export const ModeButton: React.FC<ModeButtonProps> = React.memo(({ active, onClick, title, description, size = 'md', titleStyle = 'default' }) => {
    const padding = size === 'md' ? 'p-4' : 'p-3';
    const titleSize = size === 'md' ? 'text-lg font-bold' : 'font-bold text-sm';
    
    let titleClasses = '';
    if (active) {
        titleClasses = 'text-white';
    } else if (titleStyle === 'gradient') {
        titleClasses = 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500';
    } else {
        titleClasses = 'text-slate-800 dark:text-white';
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex-1 flex flex-col justify-center text-center rounded-lg transition-all duration-300 border transform',
                padding,
                {
                    'bg-black dark:bg-slate-700 border-transparent shadow-lg scale-[1.02]': active,
                    'bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 hover:-translate-y-0.5': !active
                }
            )}
        >
            <p className={`${titleSize} ${titleClasses}`}>{title}</p>
            <p className={`mt-1 text-xs ${active ? 'text-slate-200 dark:text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>{description}</p>
        </button>
    );
});