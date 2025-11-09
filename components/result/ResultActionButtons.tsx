
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
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button
                onClick={onNewAnalysis}
                className="flex items-center justify-center gap-2"
            >
                <Icon name="arrow-path" className="w-5 h-5" />
                <span>Start New Analysis</span>
            </Button>
            <Button
                onClick={onShowShareModal}
                variant="secondary"
            >
                <Icon name="envelope" className="w-5 h-5" />
                <span>Email Report</span>
            </Button>
        </div>
    );
});
