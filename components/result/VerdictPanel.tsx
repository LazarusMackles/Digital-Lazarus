import React from 'react';
import { RadialProgress } from '../RadialProgress';

interface VerdictPanelProps {
    probability: number;
    verdict: string;
    explanation: string;
}

export const VerdictPanel: React.FC<VerdictPanelProps> = React.memo(({ probability, verdict, explanation }) => {
    const verdictColorClass = () => {
        if (probability < 40) return 'text-teal-500 dark:text-teal-400';
        if (probability < 75) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-rose-500 dark:text-rose-400';
    };

    return (
        <>
            <RadialProgress progress={probability} />
            <h2 className={`mt-6 text-3xl font-extrabold text-center ${verdictColorClass()}`}>
                {verdict}
            </h2>
            <p className="mt-4 text-center max-w-xl text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {explanation}
            </p>
        </>
    );
});