



import React from 'react';
// FIX: Corrected import path for UI components.
import { Button } from '../ui';
import { Icon } from '../icons/index';

interface ResultActionButtonsProps {
    onNewAnalysis: () => void;
    onShowShareModal: () => void;
}

export const ResultActionButtons: React.FC<ResultActionButtonsProps> = React.memo(({ onNewAnalysis, onShowShareModal }) => {
    return (
        <div className="w-full flex flex-row items-center justify-center gap-6 px-4 sm:px-0">
            <Button
                onClick={onNewAnalysis}
                variant="secondary"
                className="flex items-center justify-center gap-2"
            >
                <Icon name="arrow-path" className="w-5 h-5" />
                <span>Start New Analysis</span>
            </Button>
            <button
                type="button"
                onClick={onShowShareModal}
                className="flex items-center justify-center gap-2 font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200 py-2"
            >
                <Icon name="envelope" className="w-5 h-5" />
                <span>Email Report</span>
            </button>
        </div>
    );
});