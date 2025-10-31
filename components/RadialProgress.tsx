import React from 'react';

interface RadialProgressProps {
    progress: number;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({ progress }) => {
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getColor = (p: number) => {
        if (p < 40) return '#2dd4bf'; // teal-400
        if (p < 75) return '#facc15'; // yellow-400
        return '#f43f5e'; // rose-500
    };
    
    const color = getColor(progress);

    return (
        <div className="relative w-48 h-48">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
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
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color }}>{Math.round(progress)}%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">AI Probability</span>
            </div>
        </div>
    );
};