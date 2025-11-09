


import React from 'react';
import { Icon } from './icons/index';
// FIX: Corrected import path for UI components.
import { Card, Button } from './ui';

const ErrorFallbackComponent: React.FC = () => {
    const handleReload = () => {
        window.location.reload();
    };

    return (
        <Card className="text-center border-red-500/30 dark:border-red-500/50">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                 <svg className="w-8 h-8 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                A Critical System Malfunction!
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Mon Dieu! It seems a critical wire has been tripped in my deductive engine. The user interface has become unstable.
            </p>

            <div className="mt-6">
                <Button
                    onClick={handleReload}
                    className="flex items-center justify-center gap-2 mx-auto"
                >
                    <Icon name="arrow-path" className="w-5 h-5" />
                    <span>Reload the System</span>
                </Button>
            </div>
        </Card>
    );
};

export const ErrorFallback = React.memo(ErrorFallbackComponent);
