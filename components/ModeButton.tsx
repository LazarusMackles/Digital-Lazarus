import React from 'react';

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
    const titleSize = size === 'md' ? 'font-bold' : 'font-bold text-sm';
    
    const titleClasses = titleStyle === 'gradient'
        ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500'
        : (active ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-800 dark:text-white');

    return (
        <button
            onClick={onClick}
            className={`flex-1 text-left rounded-lg transition-all duration-300 border transform ${padding} ${
                active
                    ? 'bg-cyan-500/10 border-cyan-500'
                    : 'bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-fuchsia-500 dark:hover:border-fuchsia-400 hover:-translate-y-0.5'
            }`}
        >
            <p className={`${titleSize} ${titleClasses}`}>{title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </button>
    );
});
