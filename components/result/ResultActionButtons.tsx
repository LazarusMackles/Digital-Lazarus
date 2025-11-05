import React from 'react';
import { Button } from '../ui';
import { ArrowPathIcon, EnvelopeIcon } from '../icons/index';

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
                <ArrowPathIcon className="w-5 h-5" />
                <span>Start New Analysis</span>
            </Button>
            <Button
                onClick={onShowShareModal}
                variant="secondary"
            >
                <EnvelopeIcon className="w-5 h-5" />
                <span>Email Report</span>
            </Button>
        </div>
    );
});