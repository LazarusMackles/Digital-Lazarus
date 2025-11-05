import React from 'react';
import { VERDICT_COLORS } from '../utils/constants';

interface RadialProgressProps {
    progress: number;
}

export const RadialProgress: React.FC<RadialProgressProps> = React.memo(({ progress }) => {
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getColor = (p: number) => {
        if (p < 40) return VERDICT_COLORS.HUMAN;
        if (p < 75) return VERDICT_COLORS.MIXED;
        return VERDICT_COLORS.AI;
    };
    
    const color = getColor(progress);
    const roundedProgress = Math.round(progress);

    return (
        <div 
            className="relative w-48 h-48"
            role="img"
            aria-label={`AI Probability score: ${roundedProgress} percent.`}
        >
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
                aria-hidden="true"
            >
                <circle
                    className="stroke-slate-200 dark:stroke-slate-700"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, strokeLinecap: 'round' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div 
                className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center"
                aria-hidden="true"
            >
                <span className="text-4xl font-bold" style={{ color }}>{roundedProgress}%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">AI Probability</span>
            </div>
        </div>
    );
});
