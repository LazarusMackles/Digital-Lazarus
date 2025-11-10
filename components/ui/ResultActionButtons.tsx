import React from 'react';
import { Button } from './Button';
import { Icon } from '../icons/index';

interface ResultActionButtonsProps {
    onNewAnalysis: () => void;
    onShowShareModal: () => void;
}

export const ResultActionButtons: React.FC<ResultActionButtonsProps> = React.memo(({ onNewAnalysis, onShowShareModal }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-4">
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
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200"
            >
                <Icon name="envelope" className="w-4 h-4" />
                <span>Email Report</span>
            </button>
        </div>
    );
});